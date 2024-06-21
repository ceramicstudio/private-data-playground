import { type DagJWSResult, type DID } from "dids";
import { type DIDSession } from "did-session";
import { type Payload, type UnknownContent } from "@/types";
import { fromString, toString } from "uint8arrays";
import { CARFactory, CarBlock, type CAR } from "cartonne";
import {createInitEvent, SignedEvent, type InitEventPayload} from "./events"
import { CID } from "multiformats/cid";
import {StreamID} from "./stream-id"

export const createEvent = async (
  DID: DID,
  payload: UnknownContent,
  stream: StreamID,
): Promise<{ signedEvent: SignedEvent; payload: typeof InitEventPayload }> => {
  const event = await createInitEvent({
    content: payload,
    controller: DID,
    model: stream,
  });
  return event;
};

const base64urlToJSON = (s: string): Record<string, unknown> => {
  return JSON.parse(toString(fromString(s, "base64url"))) as Record<
    string,
    unknown
  >;
};

export const writeToRecon = async (car: CAR, endpoint: string, signedEvent: SignedEvent) => {
  try {
    if (!car) {
      throw new Error("Error creating CAR file");
    }

    const cid = car.roots[0]

     const body = JSON.stringify({
        data: car.toString(),
        id: cid!.toString(),
      })

      console.log(body);

    const response = await fetch(`${endpoint}/ceramic/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    const result = await response.json() as Record<string, unknown>;
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const getEvent = async (event: string, endpoint: string) => {
  try {
    const response = await fetch(`http://localhost:5001/ceramic/events/version`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const result = await response.json()
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};