import { signal, type Signal } from "@preact/signals-react";
import { DIDSession } from "did-session";
import type { GetWalletClientResult } from "@wagmi/core";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import type { AccountId } from "caip";
import { useAccount, useWalletClient } from "wagmi";
import { useEffect, useMemo } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { WalletClient } from "viem";

enum Stage {
  PROGRESS,
  LOGGED_IN,
  LOGGED_OUT,
}

type Underlying =
  | { stage: Stage.LOGGED_OUT }
  | { stage: Stage.PROGRESS }
  | {
      stage: Stage.LOGGED_IN;
      session: DIDSession;
      walletClient: WalletClient;
      accountId: AccountId;
    };

export class SessionState {
  private readonly signal: Signal<Underlying>;

  constructor() {
    this.signal = signal<Underlying>({
      stage: Stage.LOGGED_OUT,
    });
  }

  logIn(walletClient: GetWalletClientResult | undefined): void {
    if (!walletClient) return;
    this.signal.value = {
      stage: Stage.PROGRESS,
    };
    getAccountId(walletClient, walletClient.account.address)
      .then(async (accountId: AccountId) => {
        const authMethod = await EthereumWebAuth.getAuthMethod(
          walletClient,
          accountId,
        );

        // @ts-expect-error authMethod is not quite compatible by types
        const session = await DIDSession.get(accountId, authMethod, {
          resources: [
            "ceramic://*?model=kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3",
          ],
          expiresInSecs: 7 * 24 * 60, //1 week
        });
        localStorage.setItem("did", session.did.parent);
        this.signal.value = {
          stage: Stage.LOGGED_IN,
          session: session,
          walletClient: walletClient,
          accountId: accountId,
        };
      })
      .catch((error) => {
        this.signal.value = {
          stage: Stage.LOGGED_OUT,
        };
        console.error(error);
      });
  }

  get isLoggedIn(): boolean {
    const current = this.signal.value;
    return current.stage === Stage.LOGGED_IN;
  }

  get isLoggedOut(): boolean {
    return !this.isLoggedIn;
  }

  get didSession() {
    const current = this.signal.value;
    if (current.stage === Stage.LOGGED_IN) {
      return current.session;
    }
  }

  logOut(): void {
    this.signal.value = {
      stage: Stage.LOGGED_OUT,
    };
  }
}

export function useSession() {
  useSignals();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const session = useMemo(() => new SessionState(), []);
  useEffect(() => {
    if (address && walletClient) {
      session.logIn(walletClient);
    }
    return () => {
      session.logOut();
    };
  }, [address, walletClient]);
  return session;
}
