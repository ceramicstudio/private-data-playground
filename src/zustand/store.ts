import { create } from "zustand";
import {createDIDKey, DIDSession} from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { type GetWalletClientResult } from "@wagmi/core";
import { KeyPair } from "@biscuit-auth/biscuit-wasm";
import { CARFactory, CAR } from 'cartonne'
import {DID} from "dids";
import { AuthSession } from "./auth";

type DIDSession = {
  didSession: DIDSession,
  delegatedDid: DID,
  refresh_token: CAR,
}

type AttenuatedDIDSession = DIDSession & {
  access_token: CAR,
}

type Store = {
  endpoint: string;
  session?: DIDSession | undefined;
  setSession: (wallet: GetWalletClientResult | undefined) => void;
};

async function createAccessToken(session: DIDSession): DID {
  // create a did for the access token
  const accessTokenDid = await createDIDKey();
  const accessToken = {
    ...session.delegatedDid.capability.p,
    aud: accessTokenDid.id,
    iss: session.didSession.delegatedDid.id,
    resources: [...(cacao1.p.resources || []), `prev:${cacao1cid.toString()}`],
  }

}

const StartAuth = async (
  walletClient: GetWalletClientResult,
): Promise<DIDSession | undefined> => {
  if (walletClient) {

    localStorage.setItem("refresh", didSession.did.parent);



    console.log("isAuth:", didSession);

    return {
      didSession,
      delegatedDid,
      refreshToken,
    };
  }

  return undefined;
};

const useStore = create<Store>((set) => ({
  endpoint: "http://localhost:5001",
  session: undefined,
  setSession: (wallet) => {
    if (wallet) {
      StartAuth(wallet)
        .then((auth) => {
          set((state: Store) => ({
            ...state,
            session: auth,
          }));
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      set((state: Store) => ({
        ...state,
        session: undefined,
      }));
    }
  },
}));

export default useStore;
