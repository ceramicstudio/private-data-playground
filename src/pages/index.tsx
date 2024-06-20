import { useWalletClient } from "wagmi";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useState } from "react";
import {  type DID } from "dids";
import {StreamID} from "@/components/services/stream-id"
import {eventToCAR} from "@/components/services/encoding"
import { useAccount } from "wagmi";
import useStore from "@/zustand/store";
import Head from "next/head";
import { createEvent, writeToRecon } from "@/components/services/stream";

declare global {
  interface Window {
    ethereum?: Record<string, unknown> | undefined;
  }
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { address } = useAccount();
  const { endpoint, session, setSession } = useStore();
  const [message, setMessage] = useState<string>("");
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (address) {
      setLoggedIn(true);
      if (walletClient && loggedIn) {
        setSession(walletClient);
      }
    }
  }, [address, walletClient, loggedIn, setSession]);

  const submitMessage = async () => {
    try {
      if (!session || !message) {
        throw new Error("Session or message not found");
      }
      const streamId = new StreamID("MID", "bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a");
      console.log(streamId);
      const event = await createEvent(session.did as unknown as  DID, { message }, streamId);
      console.log(event, "event");
      const car = eventToCAR(event.payload, event.signedEvent);
      const response = await writeToRecon(car, endpoint, event.signedEvent);
      console.log(car);
      return car;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Create Trust Credentials</title>
        <meta name="description" content="" />
        <link rel="icon" href="/ceramic-favicon.svg" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
      </Head>
      <div className="border-border ">
        <main className="container mx-auto">
          <div className="relative mx-auto w-full max-w-4xl pt-4 text-center md:mt-24">
            <div className="hidden justify-center md:flex">
              <div className="flex flex-row items-center justify-center gap-5 rounded-md border border-border bg-card/60 p-1 text-xs backdrop-blur-lg"></div>
            </div>
            <h1 className="my-4 text-4xl font-extrabold md:text-7xl md:leading-tight">
              Create Trust Credentials
            </h1>
            <p className="text-md mx-auto my-4 w-full max-w-xl text-center font-medium leading-relaxed tracking-wide">
              Create trust credentials for your relationships and interactions.
            </p>
            <p className="mx-auto w-full max-w-xl text-center text-sm italic leading-relaxed tracking-wide">
              Message to send:
            </p>
            <div className="my-8 flex flex-row items-center justify-center space-x-4">
              <TextareaAutosize
                className="mb-4 h-full w-1/2 resize-none rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="This is a message"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setMessage(e.target.value);
                }}
              />
            </div>
            <button
              onClick={() => {
                void submitMessage();
              }}
              className="mr-3 mt-2 h-10 w-1/5 rounded-md text-white outline outline-2 hover:bg-blue-800"
            >
              Add Reason
            </button>
            <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
              <div className="absolute left-24 top-24 h-56 w-56 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
              <div className="absolute bottom-2 right-1/4 hidden h-56 w-56 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
              <div className="absolute bottom-1/4 left-1/3 hidden h-56 w-56 animate-blob rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
