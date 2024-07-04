import { type DID } from "dids";
import { type UnknownContent } from "@/types";
import { type CAR } from "cartonne";
import {
  createInitEvent,
  type SignedEvent,
  type InitEventPayload,
} from "./events";
import { type StreamID } from "./stream-id";

export const createEvent = async (
  DID: DID,
  payload: UnknownContent,
  modelStreamID: StreamID,
): Promise<{ signedEvent: SignedEvent; payload: typeof InitEventPayload }> => {
  return createInitEvent({
    content: payload,
    controller: DID,
    model: modelStreamID,
  });
};

export const writeToRecon = async (car: CAR, endpoint: string) => {
  try {
    if (!car) {
      throw new Error("Error creating CAR file");
    }

    const cid = car.roots[0];

    const body = JSON.stringify({
      data: car.toString(),
      id: cid!.toString(),
    });

    console.log(body);

    const response = await fetch(`${endpoint}/ceramic/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    const result = (await response.json()) as Record<string, unknown>;
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const getEvent = async (event: string, endpoint: string) => {
  try {
    const response = await fetch(`${endpoint}/ceramic/events/${event}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = (await response.json()) as Record<string, unknown>;
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};
