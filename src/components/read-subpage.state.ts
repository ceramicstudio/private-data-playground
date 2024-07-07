import type { DIDSession } from "did-session";
import { signal, type Signal } from "@preact/signals-react";

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

  get message() {
    return this.signal.value.message;
  }
}
