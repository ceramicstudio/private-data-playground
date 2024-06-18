import { type DagJWSResult } from "dids";
import { type DIDSession } from "did-session";
import { type Payload } from "@/types";
import { fromString, toString } from "uint8arrays";
import { CARFactory, CarBlock, type CAR } from "cartonne";
import { CID } from "multiformats/cid";

export const createStream = async (
  session: DIDSession,
  payload: Payload,
): Promise<DagJWSResult> => {
  const stream = await session.did.createDagJWS({
    content: {
      type: 1,
      data: payload,
    },
  });

  return stream as DagJWSResult;
};

const base64urlToJSON = (s: string): Record<string, unknown> => {
  return JSON.parse(toString(fromString(s, "base64url"))) as Record<
    string,
    unknown
  >;
};

const createCAR = (stream: DagJWSResult): { cid: string; car: string } | undefined => {
  try {
    const { jws, linkedBlock, cacaoBlock } = stream;
    const decodedProtectedHeader = base64urlToJSON(
      stream.jws.signatures[0]!.protected,
    );
    const capCID = CID.parse(
      (decodedProtectedHeader.cap as string).replace("ipfs://", ""),
    );
    const carFactory = new CARFactory();
    const car = carFactory.build();

    car.blocks.put(new CarBlock(capCID, cacaoBlock!));

    const payloadCID = jws.link;
    car.blocks.put(new CarBlock(payloadCID!, linkedBlock));
    // const payloadCID = jws.link;
    car.put(jws, {
      hasher: "sha2-256",
      isRoot: true,
    });
    // const cidBlock = car.blocks.get(cid)!.payload;
    console.log(capCID.toString());
    return {
        cid: capCID.toString(),
        car: car.toString(),
        
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const writeToRecon = async (stream: DagJWSResult, endpoint: string) => {
  try {
    const carData = createCAR(stream);
    if (!carData) {
      throw new Error("Error creating CAR file");
    }
    console.log(carData);

    const response = await fetch(`${endpoint}/ceramic/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: carData.car,
        id: carData.cid,
      }),
    });
    const result = await response.json() as Record<string, unknown>;
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};
