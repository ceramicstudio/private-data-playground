import { type Cacao } from "@didtools/cacao";
import { uint8ArrayAsBase64url } from "@didtools/codecs";
import { utf8 } from "@scure/base";
import { decode } from "codeco";
import { type DIDSession } from "did-session";

export async function createJwsCacao(
  did: DIDSession["did"],
  p: Cacao["p"],
): Promise<Cacao> {
  const jws = await did.createJWS(p);
  const header = jws.signatures[0]!.protected;
  const headerBytes = decode(uint8ArrayAsBase64url, header);
  const headerString = utf8.encode(headerBytes);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const headerJSON = JSON.parse(headerString);
  return {
    h: {
      t: "caip122",
    },
    p: p,
    s: {
      // @ts-expect-error No "jws" in codecs
      t: "jws",
      s: jws.signatures[0]!.signature,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      m: headerJSON,
    },
  };
}
