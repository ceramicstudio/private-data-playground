import type { DIDSession } from "did-session";
import { signal, type Signal } from "@preact/signals-react";
import type { StreamID } from "@/components/services/stream-id";
import { base64nopad, base64urlnopad } from "@scure/base";
import { CARFactory } from "cartonne";
import { type Cacao } from "@didtools/cacao";
import { createJwsCacao } from "@/components/create-jws-cacao";
import { getEvent } from "@/components/services/stream";
import * as DAG_JOSE from "dag-jose";

type Underlying = {
  message: string | undefined;
};

export class ReadSubpageState {
  private readonly session: DIDSession | undefined;
  private readonly endpoint: string;
  private readonly signal: Signal<Underlying>;
  private readonly carFactory: CARFactory;

  constructor(session: DIDSession | undefined, endpoint: string) {
    this.session = session;
    this.endpoint = endpoint;
    this.carFactory = new CARFactory();
    this.carFactory.codecs.add(DAG_JOSE);
    this.signal = signal({ message: undefined });
  }

  private async makeInvocationCapability(
    capability: string,
  ): Promise<string | undefined> {
    const session = this.session;
    if (!session) return;
    return import("@biscuit-auth/biscuit-wasm").then(async (module) => {
      const carBytes = base64urlnopad.decode(capability);
      const car = this.carFactory.fromBytes(carBytes);
      const delegatedCacaoCID = car.roots[0];
      if (!delegatedCacaoCID) {
        throw new Error(`No root`);
      }

      // userB -> keyB
      const innerCacao = session.cacao;
      const innerCacaoCID = car.put(innerCacao);
      // keyB -> keyB: referencing a capability from writer, and innerCacao
      const selfCacaoP: Cacao["p"] = {
        ...session.cacao.p,
        aud: session.did.id,
        iss: session.did.id,
        resources: [
          ...(session.cacao.p.resources ?? []),
          `prev:${innerCacaoCID.toString()}`,
          `prev:${delegatedCacaoCID.toString()}`,
        ],
      };
      const signedSelfCacao = await createJwsCacao(session.did, selfCacaoP);
      car.put(signedSelfCacao, { isRoot: true });

      const capabilityForInvocation = base64urlnopad.encode(car.bytes);

      console.log("capabilityForInvocation.0", capabilityForInvocation);
      return capabilityForInvocation;
    });
  }

  loadStream(streamId: StreamID, capability: string): void {
    const session = this.session;
    if (!session) return;
    console.log("loadStream", streamId, capability);
    this.makeInvocationCapability(capability)
      .then(async (capabilityForInvocation) => {
        const eventId = streamId.cid.toString();
        // FIXME Ready to pass it to rust
        console.log("ready to pass it to rust");
        const event = await getEvent(
          eventId,
          this.endpoint,
          capabilityForInvocation,
        );
        if (!event) {
          throw new Error(`Unable to load stream: ${streamId.toString()}`);
        }
        const data = (event.data as string).replace(/^m/, "");
        const bytes = base64nopad.decode(data);
        const car = this.carFactory.fromBytes(bytes);
        const root = car.roots[0];
        if (!root) {
          throw new Error(
            `Unable to find root at the event: ${eventId.toString()}`,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const dagJOSE = car.get(root);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const payloadCID = dagJOSE.link;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
        const payload = car.get(payloadCID);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const message = payload.data.message as string;
        this.signal.value = {
          message: message,
        };
      })
      .catch((error) => {
        console.error(error);
      });
  }

  get message() {
    return this.signal.value.message;
  }
}
