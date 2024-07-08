import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { useSignal, useComputed } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { useMemo } from "react";
import type { ReadSubpageState } from "@/components/read-subpage.state";
import { StreamID } from "@/components/services/stream-id";

export function ReadSubpage(props: { stateFactory: () => ReadSubpageState }) {
  useSignals();
  const state = useMemo(() => props.stateFactory(), [props]);
  const streamIdString = useSignal("");
  const streamId = useComputed(() => {
    try {
      return StreamID.fromString(streamIdString.value);
    } catch {
      return undefined;
    }
  });
  const capability = useSignal("");
  const isButtonEnabled = useComputed(() => {
    return Boolean(streamId.value) && Boolean(capability.value);
  });
  const message = useComputed(() => state.message);

  const loadStream = () => {
    const streamIdValue = streamId.value;
    const capabilityValue = capability.value;
    if (!streamIdValue) return;
    if (!capabilityValue) return;
    state.loadStream(streamIdValue, capabilityValue);
  };

  return (
    <section className="relative h-full w-full border-b border-border bg-gradient-to-b from-background via-background via-90% to-transparent">
      <div className="container  w-full">
        <div className="my-24 w-full">
          <div className="items-left mt-12 flex w-full flex-row justify-start">
            <div key={"main"} className="flex w-full flex-col">
              <>
                <p className="text-1xl md:text-1xl mt-4 font-semibold">
                  Stream ID
                </p>
                <TextareaAutosize
                  className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Stream ID here..."
                  value={streamIdString.value}
                  onChange={(e) => {
                    streamIdString.value = e.target.value;
                  }}
                />
                <p className="text-1xl md:text-1xl mt-4 font-semibold">
                  Capability
                </p>
                <TextareaAutosize
                  className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your capability here..."
                  value={capability.value}
                  onChange={(e) => {
                    capability.value = e.target.value;
                  }}
                />
                {message.value ? (
                  <>
                    <p className="text-1xl md:text-1xl mt-4 font-semibold">
                      Message
                    </p>
                    <TextareaAutosize
                      disabled={Boolean(message.value)}
                      className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={message.value}
                    />
                  </>
                ) : (
                  <Button
                    className="mt-4 w-1/5 self-start text-xs"
                    variant="secondary"
                    disabled={!isButtonEnabled.value}
                    onClick={loadStream}
                  >
                    Load
                  </Button>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 -z-10 h-full max-h-full w-full blur-2xl">
        <div className="absolute bottom-0 left-0 h-56 w-1/2 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
        <div className="absolute bottom-0 right-0 h-56 w-1/2 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000"></div>
      </div>
    </section>
  );
}
