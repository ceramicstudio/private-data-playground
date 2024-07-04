import { useWalletClient } from "wagmi";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useState } from "react";
import { type DID } from "dids";
import { StreamID } from "@/components/services/stream-id";
import { eventToCAR } from "@/components/services/encoding";
import { useAccount } from "wagmi";
import useStore from "@/zustand/store";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Head from "next/head";
import {
  createEvent,
  writeToRecon,
  getEvent,
} from "@/components/services/stream";

declare global {
  interface Window {
    ethereum?: Record<string, unknown> | undefined;
  }
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean | string>("loading");
  const { address } = useAccount();
  const { endpoint, session, setSession } = useStore();
  const [message, setMessage] = useState<string>("");
  const { data: walletClient } = useWalletClient();
  const [writeStreamId, setWriteStreamId] = useState<string>("");
  const [readStreamId, setReadStreamId] = useState<string>("");
  const [delegatedReadId, setDelegatedReadId] = useState<string>("");
  const [writeOrRead, setWriteOrRead] = useState<string | undefined>(undefined);
  const [capability, setCapability] = useState<string>("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
    if (address) {
      setLoggedIn(true);
      if (walletClient && loggedIn) {
        setSession(walletClient);
      }
    }
    return () => {
      setLoggedIn(false);
      setSession(undefined);
      setMessage("");
      setWriteStreamId("");
      setReadStreamId("");
      setDelegatedReadId("");
      setCapability("");
    };
  }, [address, walletClient, loggedIn, setSession, writeOrRead, setTheme]);

  const submitMessage = async () => {
    try {
      if (!session || !message) {
        throw new Error("Session or message not found");
      }
      const MODEL_STREAM_ID = new StreamID(
        "MID",
        "bagcqcera26p4nkhr7r6a3l5sbzpwyfpwj5xdwf5mzdyizxaufsaydbutiznq", // corresponding CID of parent model: https://ceramic-orbisdb-mainnet-direct.hirenodes.io/api/v0/streams/kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3
      );
      const event = await createEvent(
        session.did as unknown as DID,
        { message },
        MODEL_STREAM_ID,
      );
      console.log(event, "event");
      const car = eventToCAR(event.payload, event.signedEvent);
      const response = await writeToRecon(car, endpoint);
      const gotEvent = await getEvent(car.roots[0]!.toString(), endpoint);
      const resultId = new StreamID("MID", gotEvent?.id as string);
      setWriteStreamId(resultId.baseID.toString());
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const createCapability = async () => {
    try {
      if (!session || !delegatedReadId || !writeStreamId) {
        throw new Error("Session, delegatedReadId, or writeStreamId not found");
      }
      // do something here to create a capability
      setCapability(
        "thisisafakecabailitywithlotsofcharactersjusttoseehowitlooks",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadStream = async () => {
    try {
      if (!session || !readStreamId || !capability) {
        throw new Error("Session, readStreamId, or capability not found");
      }
      // do something here to confirm capability and retrieve the message
      setMessage("this is the cleartext message");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      {loggedIn && loggedIn !== "loading" && (
        <div className="mt-4 flex w-screen flex-row items-center justify-center gap-4 p-4">
          <Button
            variant="outline"
            className="ml-4 mr-4 text-xs"
            onClick={() => {
              setWriteOrRead("write");
            }}
          >
            Write
          </Button>
          <Button
            className="text-xs"
            variant="outline"
            onClick={() => {
              setWriteOrRead("read");
            }}
          >
            Read
          </Button>
        </div>
      )}
      <Head>
        <title>Create Trust Credentials</title>
        <meta name="description" content="" />
        <link rel="icon" href="/ceramic-favicon.svg" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
      </Head>
      <div className="border-border ">
        <main className="container mx-auto">
          {loggedIn && loggedIn !== "loading" && (
            <>
              <div className="relative mx-auto w-full max-w-4xl pt-4 text-center">
                <div className="mt-10 flex flex-row items-center justify-center space-x-4">
                  <Card key={"key"} className="w-1/3 self-start">
                    <CardHeader></CardHeader>
                    <CardContent>
                      <CardTitle>C1 Endpoint</CardTitle>
                      <CardDescription className="mt-4">
                        {endpoint}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
                  <div className="absolute left-24 top-24 h-56 w-56 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
                  <div className="absolute bottom-2 right-1/4 hidden h-56 w-56 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
                  <div className="absolute bottom-1/4 left-1/3 hidden h-56 w-56 animate-blob rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
                </div>
              </div>

              {writeOrRead === "write" && (
                <section className="relative h-full w-full border-b border-border bg-gradient-to-b from-background via-background via-90% to-transparent">
                  <div className="container  w-full">
                    <div className="my-24 w-full">
                      <div className="items-left mt-12 flex w-full flex-row justify-start">
                        <div key={"main"} className="flex w-full flex-col">
                          <>
                            <p className="text-1xl md:text-1xl mt-4 font-semibold">
                              Message
                            </p>
                            <TextareaAutosize
                              className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your message here..."
                              value={message}
                              onChange={(e) => {
                                setMessage(e.target.value);
                              }}
                            />
                            <Button
                              className="mt-4 w-1/5 self-start text-xs"
                              variant="secondary"
                              onClick={submitMessage}
                            >
                              Create
                            </Button>

                            {writeStreamId && (
                              <>
                                <div className="mt-4 grid w-full max-w-[23rem] grid-cols-8 gap-2">
                                  <label className="sr-only">Label</label>
                                  <p className="col-span-6 mt-12 mt-4 text-sm ">
                                    Stream ID
                                  </p>
                                  <input
                                    id="writeStreamId"
                                    type="text"
                                    className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    value={writeStreamId}
                                    disabled
                                  ></input>
                                  <button
                                    onClick={() => {
                                      void navigator.clipboard.writeText(
                                        writeStreamId,
                                      );
                                    }}
                                    className="col-span-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
                                  >
                                    <span id="default-message">Copy</span>
                                    <span
                                      id="success-message"
                                      className="inline-flex hidden items-center"
                                    >
                                      <svg
                                        className="me-1.5 h-3 w-3 text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 16 12"
                                      >
                                        <path
                                          stroke="currentColor"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M1 5.917 5.724 10.5 15 1.5"
                                        />
                                      </svg>
                                      Copied!
                                    </span>
                                  </button>
                                </div>
                                <>
                                  <p className="text-1xl md:text-1xl mt-12 mt-4 font-semibold">
                                    Delegate read access to
                                  </p>
                                  <TextareaAutosize
                                    className="outline-dark mt-4 min-h-12 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your desired delegated DID here..."
                                    value={delegatedReadId}
                                    onChange={(e) => {
                                      setDelegatedReadId(e.target.value);
                                    }}
                                  />
                                  <Button
                                    className="mt-4 w-1/5 self-start text-xs"
                                    variant="secondary"
                                    onClick={() => {
                                      void createCapability();
                                    }}
                                  >
                                    Create Capability
                                  </Button>
                                </>
                                {capability && (
                                  <div className="mt-4 grid w-full max-w-[23rem] grid-cols-8 gap-2">
                                    <label className="sr-only">Label</label>
                                    <p className="col-span-6 mt-12 mt-4 text-sm ">
                                      Capability
                                    </p>
                                    <input
                                      id="writeStreamId"
                                      type="text"
                                      className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                      value={capability}
                                      disabled
                                    ></input>
                                    <button
                                      onClick={() => {
                                        void navigator.clipboard.writeText(
                                          capability,
                                        );
                                      }}
                                      className="col-span-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
                                    >
                                      <span id="default-message">Copy</span>
                                      <span
                                        id="success-message"
                                        className="inline-flex hidden items-center"
                                      >
                                        <svg
                                          className="me-1.5 h-3 w-3 text-white"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 16 12"
                                        >
                                          <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M1 5.917 5.724 10.5 15 1.5"
                                          />
                                        </svg>
                                        Copied!
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </>
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
              )}

              {writeOrRead === "read" && (
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
                              value={readStreamId}
                              onChange={(e) => {
                                setReadStreamId(e.target.value);
                              }}
                            />
                            <p className="text-1xl md:text-1xl mt-4 font-semibold">
                              Capability
                            </p>
                            <TextareaAutosize
                              className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your Stream ID here..."
                              value={capability}
                              onChange={(e) => {
                                setCapability(e.target.value);
                              }}
                            />
                            {message ? (
                              <>
                                <p className="text-1xl md:text-1xl mt-4 font-semibold">
                                  Message
                                </p>
                                <TextareaAutosize
                                  className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={message}
                                />
                              </>
                            ) : (
                              <Button
                                className="mt-4 w-1/5 self-start text-xs"
                                variant="secondary"
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
              )}
            </>
          )}
          {!loggedIn && (
            <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center pt-4 text-center md:mt-24">
              <h1 className=" text-4xl font-extrabold md:text-4xl md:leading-tight">
                Connect your wallet to get started
              </h1>
              <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
                <div className="absolute left-24 top-24 h-56 w-56 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
                <div className="absolute bottom-2 right-1/4 hidden h-56 w-56 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
                <div className="absolute bottom-1/4 left-1/3 hidden h-56 w-56 animate-blob rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
