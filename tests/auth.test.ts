import { AuthSession } from '../src/zustand/auth';
import { createWalletClient, http } from 'viem'
import { foundry } from 'viem/chains'
import { jest } from '@jest/globals'
import {GetWalletClientResult} from "@wagmi/core";
import {CID} from "multiformats/cid";
import {CAR} from "cartonne";
import {Cacao} from '@didtools/cacao';
import { getEIP191Verifier } from '@didtools/pkh-ethereum'
import { DID } from 'dids'
import KeyDidResolver from 'key-did-resolver'
import { uint8ArrayAsBase64url } from '@didtools/codecs'
import stringify from 'fast-json-stable-stringify'

const getMockWalletClient = () =>
    createWalletClient({
        transport: http(foundry.rpcUrls.default.http[0]),
        chain: foundry,
        account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        pollingInterval: 100,
    })

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const didKeyVerifier = new DID({ resolver: KeyDidResolver.getResolver() })

async function jwsVerifier(cacao: Cacao) {
    const header = uint8ArrayAsBase64url.encode(
        new Uint8Array(textEncoder.encode(stringify(cacao.s?.m || {}))),
    )
    const signature = cacao.s?.s ?? ''
    const payload = uint8ArrayAsBase64url.encode(
        new Uint8Array(textEncoder.encode(stringify(cacao.p))),
    )
    await didKeyVerifier.verifyJWS({
        payload: payload,
        signatures: [
            {
                protected: header,
                signature: signature,
            },
        ],
    })
}

const VERIFIERS = {
    ...getEIP191Verifier(),
    jws: jwsVerifier,
}

async function verifyCACAOChain(car: CAR) {
    const root = car.roots[0]
    if (!root) throw new Error(`No root capability!`)
    let next: Cacao | undefined = car.get(root)
    while (next) {
        await Cacao.verify(next, { verifiers: VERIFIERS })
        if (next.p.resources) {
            const resources = next.p.resources
            const prevs = resources
                .filter((r) => r.match(/^prev:/))
                .map((p) => p.replace(/^prev:/, ''))
                .map((c) => CID.parse(c))
            const prevCID = prevs[0]
            if (prevCID) {
                const prev = car.get(prevCID)
                if (prev) {
                    next = prev
                } else {
                    throw new Error(`No prev CACAO provided`)
                }
            } else {
                next = undefined
            }
        } else {
            next = undefined
        }
    }
}

describe('Auth Session', () => {
    let wallet: GetWalletClientResult

    beforeEach(async () => {
        wallet = getMockWalletClient()
    })

    test('should create a valid cacao for refresh', async () => {
        const auth = await AuthSession.initialize(wallet)
        expect(auth.inner.cacao.p.resources).toEqual(["ceramic://*?model=kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3"])
        expect(auth.inner.cacao.p.aud).toEqual(auth.delegated.id)
    })

    test('should create a valid cacao for access', async () => {
        const auth = await AuthSession.initialize(wallet)
        const token = await auth.getAccessToken()
        await verifyCACAOChain(token.car)
    })
})