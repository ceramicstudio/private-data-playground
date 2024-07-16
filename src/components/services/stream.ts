"use client";

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
): Promise<{ signedEvent: SignedEvent; codec: typeof InitEventPayload }> => {
  return createInitEvent({
    content: payload,
    controller: DID,
    model: modelStreamID,
  });
};

export async function writeToRecon(car: CAR, endpoint: string): Promise<void> {
  try {
    if (!car) {
      throw new Error("Error creating CAR file");
    }

    const cid = car.roots[0];

    const body = JSON.stringify({
      data: car.toString(),
      id: cid!.toString(),
    });

    await fetch(`${endpoint}/ceramic/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getEvent(
  eventId: string,
  endpoint: string,
  capability?: string,
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (capability) {
      headers.Authorization = capability;
    }
    const endpointURL = new URL(`${endpoint}/`.replace(/\/\/$/, "/"));
    const url = new URL(`/ceramic/events/${eventId}`, endpointURL);
    url.searchParams.set("resource", eventId);

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    console.error(error);
  }
}
