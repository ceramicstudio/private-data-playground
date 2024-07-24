import { type CAR, CARFactory, CarBlock } from "cartonne";
import { type Codec } from "codeco";
import { SignedEvent } from "./events";
import * as dagJson from "@ipld/dag-json";
import * as dagJose from "dag-jose";
import { type bases } from "multiformats/basics";
import { CID } from "multiformats/cid";
import { toString as bytesToString, fromString } from "uint8arrays";
import { sha256 } from "multihashes-sync/sha2";

export const MAX_BLOCK_SIZE = 256000; // 256 KB

export function base64urlToJSON<T = Record<string, unknown>>(value: string): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(bytesToString(fromString(value, "base64url")));
}

/**
 * Restricts block size to MAX_BLOCK_SIZE.
 *
 * @param block - Uint8Array of IPLD block
 * @param cid - Commit CID
 */
export function restrictBlockSize(block: Uint8Array, cid: CID): void {
  const size = block.byteLength;
  if (size > MAX_BLOCK_SIZE) {
    throw new Error(
      `${cid.toString()} commit size ${size} exceeds the maximum block size of ${MAX_BLOCK_SIZE}`,
    );
  }
}

const carFactory = new CARFactory();
carFactory.codecs.add(dagJose);
carFactory.codecs.add(dagJson);
carFactory.hashers.add(sha256);

export type Base = keyof typeof bases;

export const DEFAULT_BASE: Base = "base64url";

export function signedEventToCAR(event: SignedEvent): CAR {
  const { jws, linkedBlock, cacaoBlock } = event;
  const car = carFactory.build();

  // if cacao is present, put it into ipfs dag
  if (cacaoBlock != null) {
    const header = base64urlToJSON<{ cap: string }>(
      jws.signatures[0]!.protected,
    );
    const capCID = CID.parse(header.cap.replace("ipfs://", ""));
    car.blocks.put(new CarBlock(capCID, cacaoBlock));
    restrictBlockSize(cacaoBlock, capCID);
  }

  const payloadCID = jws.link;
  if (payloadCID != null) {
    // Encode payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    car.blocks.put(new CarBlock(payloadCID, linkedBlock));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    restrictBlockSize(linkedBlock, payloadCID);
  }

  // Encode JWS itself
  const cid = car.put(jws, {
    codec: "dag-jose",
    hasher: "sha2-256",
    isRoot: true,
  });
  // biome-ignore lint/style/noNonNullAssertion: added to CAR file right before
  const cidBlock = car.blocks.get(cid)!.payload;
  restrictBlockSize(cidBlock, cid);

  return car;
}

export function encodeEventToCAR(codec: Codec<unknown>, event: unknown): CAR {
  const car = carFactory.build();
  const cid = car.put(codec.encode(event), { isRoot: true });
  // biome-ignore lint/style/noNonNullAssertion: added to CAR file right before
  const cidBlock = car.blocks.get(cid)!.payload;
  restrictBlockSize(cidBlock, cid);
  return car;
}

export function eventToCAR(codec: Codec<unknown>, event: unknown): CAR {
  return SignedEvent.is(event)
    ? signedEventToCAR(event)
    : encodeEventToCAR(codec, event);
}
