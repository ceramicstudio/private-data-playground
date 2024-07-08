import type { DIDSession } from "did-session";
import { signal, type Signal } from "@preact/signals-react";
import type { StreamID } from "@/components/services/stream-id";

type Underlying = {
  message: string | undefined;
};

export class ReadSubpageState {
  private readonly session: DIDSession | undefined;
  private readonly endpoint: string;
  private readonly signal: Signal<Underlying>;

  constructor(session: DIDSession | undefined, endpoint: string) {
    this.session = session;
    this.endpoint = endpoint;
    this.signal = signal({ message: undefined });
  }

  loadStream(streamId: StreamID, capability: string) {
      // Do Nothing
  }

  get message() {
    return this.signal.value.message;
  }
}
