# Privacy App (Draft)
Eventual description will go here

## Getting Started

1. Create a WalletConnect project ID by visiting https://cloud.walletconnect.com/sign-in, create a new project (with a name of your choosing and the `App` type selected), and copy the `Project ID` key once available. You will need to enter this into src/pages/_app.tsx on line 8 to assign to the `projectId` value.

2. Install your dependencies:

Install your dependencies:

```bash
npm install
```

3. Run Ceramic in recon mode:

```bash
npm run ceramic
```

4. In a new terminal, start up your UI:

```bash
npm run dev
```