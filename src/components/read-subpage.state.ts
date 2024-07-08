import type { DIDSession } from "did-session";
import { signal, type Signal } from "@preact/signals-react";
import type { StreamID } from "@/components/services/stream-id";
import { base64urlnopad, utf8 } from "@scure/base";
import { CARFactory } from "cartonne";
import { Cacao } from "@didtools/cacao";
import { createJwsCacao } from "@/components/create-jws-cacao";

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
    this.signal = signal({ message: undefined });
  }

  loadStream(streamId: StreamID, capability: string) {
    const session = this.session;
    if (!session) return;
    const local = session.did;
    const subjectDIDUrl = session.did.parent;
    console.log("loadStream", streamId, capability);
    import("@biscuit-auth/biscuit-wasm")
      .then(async (module) => {
        const biscuit = module.biscuit;
        const BiscuitBuilder = module.BiscuitBuilder;

        const carBytes = base64urlnopad.decode(capability);
        const car = this.carFactory.fromBytes(carBytes);
        const delegatedCacaoCID = car.roots[0];
        if (!delegatedCacaoCID) {
          throw new Error(`No root`);
        }

        const innerCacao = session.cacao;
        const innerCacaoCID = car.put(innerCacao);
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
        const signedCacao = await createJwsCacao(session.did, selfCacaoP);
        const signedCacaoCID = car.put(signedCacao);
        console.log('s', signedCacaoCID.toString())

        // // const rootCID = car.roots[0];
        // if (!rootCID) {
        //   throw new Error("No root CID");
        // }
        // const rootCacaoBlock = car.blocks.get(rootCID);
        // if (!rootCacaoBlock) {
        //   throw new Error(`Can't find cid ${rootCID.toString()}`);
        // }
        // const cacao = await Cacao.fromBlockBytes(rootCacaoBlock.payload);
        // const cacaoResources = cacao.p.resources ?? [];
        // const biscuitResource = cacaoResources
        //   .find((r) => r.startsWith("biscuit:"))
        //   ?.replace("biscuit:", "");
        // if (!biscuitResource) {
        //   throw new Error(`Can't find biscuit`);
        // }
        // const biscuitString = utf8.encode(
        //   base64urlnopad.decode(biscuitResource),
        // );
        // console.log("biscuit", biscuitString);
        // const builder = new BiscuitBuilder();
        // builder.addCode(biscuitString);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  get message() {
    return this.signal.value.message;
  }
}
