import { type UnknownContent } from "@/types";
import sizeof from "object-sizeof";
import { type DID } from "dids";
import {
  cid,
  didString,
  asDIDString,
  uint8array,
  JWSSignature,
} from "@didtools/codecs";
import {
  type TypeOf,
  array,
  boolean,
  literal,
  optional,
  sparse,
  string,
  tuple,
  unknown,
  Type,
  type Context,
} from "codeco";
import { StreamID } from "./stream-id";

export type CreateInitHeaderParams = {
  model: StreamID;
  // FIXME SU: Sorry types, I do not know why that does not work
  // controller: DIDString | string;
  controller: string;
  unique?: Uint8Array | boolean;
  context?: StreamID;
  shouldIndex?: boolean;
};

export const streamIDAsBytes = new Type<StreamID, Uint8Array, Uint8Array>(
  "StreamID-as-bytes",
  (input: unknown): input is StreamID => StreamID.isInstance(input),
  (input: Uint8Array, context: Context) => {
    try {
      return context.success(StreamID.fromBytes(input));
    } catch {
      return context.failure();
    }
  },
  (streamId) => streamId.bytes,
);

export const MAX_DOCUMENT_SIZE = 16_000_000;

export type CreateInitEventParams<T extends UnknownContent = UnknownContent> = {
  content: T;
  controller: DID;
  model: StreamID;
  context?: StreamID;
  shouldIndex?: boolean;
};

export const InitEventHeader = sparse(
  {
    controllers: tuple([didString] as const),
    model: streamIDAsBytes,
    sep: string,
    unique: optional(uint8array),
    context: optional(streamIDAsBytes),
    shouldIndex: optional(boolean),
  },
  "InitEventHeader",
);
export type InitEventHeader = TypeOf<typeof InitEventHeader>;

export const InitEventPayload = sparse(
  {
    data: unknown,
    header: InitEventHeader,
  },
  "InitEventPayload",
);
export type InitEventPayload = TypeOf<typeof InitEventPayload>;

export type PartialInitEventHeader = Omit<InitEventHeader, "controllers"> &
  Pick<Partial<InitEventHeader>, "controllers">;

export const DagJWS = sparse({
  payload: string,
  signatures: array(JWSSignature),
  link: optional(cid),
});
export type DagJWS = TypeOf<typeof DagJWS>;

export const SignedEvent = sparse(
  {
    jws: DagJWS,
    linkedBlock: uint8array,
    cacaoBlock: optional(uint8array),
  },
  "SignedEvent",
);
export type SignedEvent = TypeOf<typeof SignedEvent>;

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export function assertValidContentLength(content: unknown) {
  if (content != null) {
    const contentLength = sizeof(content);
    if (contentLength > MAX_DOCUMENT_SIZE) {
      throw new Error(
        `Content has size of ${contentLength}B which exceeds maximum size of ${MAX_DOCUMENT_SIZE}B`,
      );
    }
  }
}

export const DocumentInitEventHeader = sparse(
  {
    controllers: tuple([didString] as const),
    model: streamIDAsBytes,
    sep: literal("model"),
    unique: optional(uint8array),
    context: optional(streamIDAsBytes),
    shouldIndex: optional(boolean),
  },
  "DocumentInitEventHeader",
);
export type DocumentInitEventHeader = TypeOf<typeof DocumentInitEventHeader>;

export function createInitHeader(
  params: CreateInitHeaderParams,
): DocumentInitEventHeader {
  const header: DocumentInitEventHeader = {
    controllers: [asDIDString(params.controller)],
    model: params.model,
    sep: "model",
  };

  // Handle unique field
  if (params.unique == null || params.unique === false) {
    // Generate a random unique value (account relation of type "list")
    header.unique = randomBytes(12);
  } else if (params.unique instanceof Uint8Array) {
    // Use the provided unique value (account relation of type "set")
    header.unique = params.unique;
  } // Otherwise don't set any unique value (account relation of type "single")

  // Add optional fields
  if (params.context != null) {
    header.context = params.context;
  }
  if (params.shouldIndex != null) {
    header.shouldIndex = params.shouldIndex;
  }

  // Validate header before returning
  if (!DocumentInitEventHeader.is(header)) {
    throw new Error("Invalid header");
  }
  return header;
}

export async function signEvent(
  did: DID,
  payload: Record<string, unknown>,
): Promise<SignedEvent> {
  if (!did.authenticated) {
    await did.authenticate();
  }
  const { linkedBlock, ...rest } = await did.createDagJWS(payload);
  return { ...rest, linkedBlock: new Uint8Array(linkedBlock) };
}

export async function createSignedInitEvent<T>(
  did: DID,
  data: T,
  header: PartialInitEventHeader,
): Promise<SignedEvent> {
  if (!did.authenticated) {
    await did.authenticate();
  }
  const controllers = header.controllers ?? [
    asDIDString(did.hasParent ? did.parent : did.id),
  ];
  const payload = InitEventPayload.encode({
    data,
    header: { ...header, controllers },
  });
  return await signEvent(did, payload);
}

export async function createInitEvent<
  T extends UnknownContent = UnknownContent,
>(
  params: CreateInitEventParams<T>,
): Promise<{ signedEvent: SignedEvent; codec: typeof InitEventPayload }> {
  const { content, controller, ...headerParams } = params;
  assertValidContentLength(content);
  const header = createInitHeader({
    ...headerParams,
    controller: controller.id,
    unique: false, // non-deterministic event
  });
  const signedEvent = await createSignedInitEvent(controller, content, header);
  return { signedEvent, codec: InitEventPayload };
}
