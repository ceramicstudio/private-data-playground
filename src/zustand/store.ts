import { create } from "zustand";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { type GetWalletClientResult } from "@wagmi/core";

type Store = {
  endpoint: string;
  session?: DIDSession;
  setSession: (wallet: GetWalletClientResult) => void;
};

const StartAuth = async (
  walletClient: GetWalletClientResult,
): Promise<DIDSession | undefined> => {
  if (walletClient) {
    const accountId = (await getAccountId(
      walletClient,
      walletClient.account.address,
    )) as unknown as string;

    const authMethod = await EthereumWebAuth.getAuthMethod(
      walletClient,
      // @ts-expect-error did-session
      accountId,
    );

    // @ts-expect-error did-session
    const session = await DIDSession.get(accountId, authMethod, {
      resources: ["ceramic://*"],
    });
    localStorage.setItem("did", session.did.parent);

    console.log("isAuth:", session);
    return session;
  }

  return undefined;
};

const useStore = create<Store>((set) => ({
  endpoint: "http://localhost:5001",
  session: undefined,
  setSession: (wallet) => {
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
  },
}));

export default useStore;
