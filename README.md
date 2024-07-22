# Private Data Playground

This demo application uses a minimal webapp to demonstrate how Ceramic can facilitate the sharing of private data between two users. In this iteration, the demo only implements access control on the Ceramic-One data feed API, showing how data can only be read if the controlling user grants the user who desires access a capability. Both users share the same node, but can only access each others data if explicitly granted that capability.

## Getting Started

1. First, create a copy of the [example env file](.env.example) and rename it `.env` in the root of this directory.

2. Next, create a WalletConnect project ID by visiting the [WalletConnect Sign In](https://cloud.walletconnect.com/sign-in) page, create a new project (with a name of your choosing and the `App` type selected), and copy the `Project ID` key once available. 

In your new environment file, assign this value to `NEXT_PUBLIC_PROJECT_ID`.

3. Clone the [rust-ceramic](https://github.com/ceramicnetwork/rust-ceramic) repository and check out into the [feat/private-data](https://github.com/ceramicnetwork/rust-ceramic/tree/feat/private-data) branch. Next, run the build process before initializing your node:

```bash
cargo build
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