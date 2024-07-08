import {createDIDKey, DIDSession} from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { CARFactory, CAR } from 'cartonne'
import {DID} from "dids";
import {GetWalletClientResult} from "@wagmi/core";
import {biscuit, check, fact} from "@biscuit-auth/biscuit-wasm";
import {Cacao, Payload} from "@didtools/cacao";
import { decode } from "codeco";
import {uint8ArrayAsBase64url} from "@didtools/codecs";

export type AccessToken = {
    did: DID;
    car: CAR;
}

function encodeBase64url(s: string): string {
    return uint8ArrayAsBase64url.encode(
        new Uint8Array(AuthSession.textEncoder.encode(s)),
    )
}

export class AuthSession {
    static carFactory = new CARFactory();
    static textEncoder = new TextEncoder();
    static textDecoder = new TextDecoder();
    inner: DIDSession;
    delegated: DID;

    constructor(inner: DIDSession, delegated: DID) {
        this.inner = inner;
        this.delegated = delegated;
    }

    async getAccessToken(): Promise<AccessToken> {
        const car = AuthSession.carFactory.build()
        const delegationCID = car.put(this.inner.cacao)

        // create a biscuit for specification
        const builder = biscuit`
            user(${this.delegated.id});
        `;
        for(const resource in this.inner.cacao.p.resources) {
            builder.addFact(fact`right(${this.delegated.id}, ${resource}`)
        }

        // create a cacao for short term attenuation
        const exp = new Date(Date.now() + 1000*60*5) //5 minutes
        builder.addCheck(check`check if time($time) < ${exp.toISOString()}`)
        const attenuatedCacao: Payload = {
            ...this.inner.cacao.p,
            aud: this.delegated.id,
            iss: this.delegated.id,
            resources: [
                ...(this.inner.cacao.p.resources ?? []),
                `prev:${delegationCID.toString()}`,
                `biscuit:${encodeBase64url(builder.toString())}`
            ],
            exp: exp.toISOString()
        };
        // sign our attenuated cacao
        const jws = await this.delegated.createJWS(attenuatedCacao)
        if(jws.signatures.length == 0 || !jws.signatures[0]) {
            throw new Error('Failed to sign attenuated cacao')
        }
        const header = jws.signatures[0].protected
        const headerBytes = decode(uint8ArrayAsBase64url, header)
        const headerString = AuthSession.textDecoder.decode(headerBytes)
        const headerJSON = JSON.parse(headerString)
        const signedCacao: Cacao = {
            h: {
                t: 'caip122',
            },
            p: attenuatedCacao,
            s: {
                t: 'jws',
                s: jws.signatures[0].signature,
                m: headerJSON,
            },
        };

        car.put(signedCacao, { isRoot: true });
        return {
            did: this.delegated,
            car,
        }
    }

    static async initialize(walletClient: GetWalletClientResult): Promise<AuthSession> {
        if(!walletClient) {
            throw new Error('No wallet client');
        }
        const accountId = (await getAccountId(
            walletClient,
            walletClient.account.address,
        )) as unknown as string;

        const authMethod = await EthereumWebAuth.getAuthMethod(
            walletClient,
            // @ts-expect-error did-session
            accountId,
        );

        // create a did for delegation
        const delegatedDid = await createDIDKey();

        // @ts-expect-error did-session
        // delegate to our key
        const inner = await DIDSession.get(accountId, authMethod, {
            uri: delegatedDid.id,
            resources: ["ceramic://*?model=kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3"],
            expiresInSecs: 7*24*60, //1 week
        });

        return new AuthSession(inner, delegatedDid);
    }
}