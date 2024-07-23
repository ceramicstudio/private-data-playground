# Private Data Playground

This demo application uses a minimal webapp to demonstrate how Ceramic can facilitate the sharing of private data between two users. In this iteration, the demo only implements access control on the Ceramic-One data feed API, showing how data can only be read if the controlling user grants the user who desires access a capability. Both users share the same node, but can only access each others data if explicitly granted that capability.

## Getting Started

1. First, create a copy of the [example env file](.env.example) and rename it `.env` in the root of this directory.

2. Next, create a WalletConnect project ID by visiting the [WalletConnect Sign In](https://cloud.walletconnect.com/sign-in) page, create a new project (with a name of your choosing and the `App` type selected), and copy the `Project ID` key once available. 

In your new environment file, assign this value to `NEXT_PUBLIC_PROJECT_ID`.

3. Clone the [rust-ceramic](https://github.com/ceramicnetwork/rust-ceramic) repository and check out into the [feat/private-data](https://github.com/ceramicnetwork/rust-ceramic/tree/feat/private-data) branch. Next, run the build process before initializing your node:

```bash
cargo run -p ceramic-one -- daemon
```

4. Back in the root of this repository, install your dependencies:

Install your dependencies:

```bash
npm install
```

5. Finally, start up your UI:

```bash
npm run dev
```

6. Navigate to `http://localhost:3000` in your browser to view the UI

## Interacting with the Demo

In your browser you'll see a simple application layout with the option to "Connect Wallet" in the navigation. Follow along with the steps below to interact with the app:

### Creating Capability Object

1. Click the "Connect Wallet" button to connect your wallet. Keep track of which account you use for this portion - we will be using different accounts to read this data. Please ensure you are authenticating with Eth Mainnet for all sign-ins throughout this demo.

2. You will see a secondary signature request with the message "Give this application access to some of your data on Ceramic" - signing this request will create an authenticated browser session that the application will reference when writing data on your behalf. Go ahead and approve this request by clicking "Sign In".

3. Click on the "Write" toggle above the "C1 Endpoint" box. You will be prompted to enter a message - this can be any arbitrary message you'd like to use. Go ahead and enter this here and click "Create".

4. Open up your computer notepad and save the value you'll see under "Stream ID". We will need this later.

5. Grab another Eth address that you own and enter it into the text area underneath "Delegate read access to" - you will see that `did:pkh:eip155:1:` is automatically appended to your address in order to conform to `did:pkh` formatting. Make a note of which address you entered

6. Finally, click "Create Capability" to generate the capability object which delegates read access to the Eth address you own. Paste the result into your notepad as well - we will use this later.

### Reading Data Successfully

1. Manually disconnect the account you used for the previous session and sign in using the address you entered for step 5 from the previous section.

2. Click the "Read" toggle above the "C1 Endpoint" box.

3. Enter the value for the Stream ID you saved in step 4 from the previous section under "Stream ID".

4. Do the same for the "Capability" text input.

5. Click on the "Load" button in order to load the stream contents given the delegated capability.

6. You should now be able to view the original message you entered and saved from the previous section.

### Reading Data Unsuccessfully

1. Still in the same UI, make a random change to the capability value under "Capability" thus invalidating it.

2. Press "Load" again - you will see that we are now unable to access the same stream due to the invalid capability object.


