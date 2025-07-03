# Division 1 Crypto ($D1C) Token Faucet

A simple Solana token faucet for the Division 1 Crypto ($D1C) token. Users can request 100 $D1C tokens by providing their Solana wallet address.

## Live Demo

🌐 **Deployed at:** [d1c-faucet.vercel.app](https://d1c-faucet.vercel.app)

## Features

- 🪙 Request 100 $D1C tokens per transaction
- 🔐 Automatic associated token account creation

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain:** Solana Web3.js, SPL Token
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Solana CLI (optional, for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd d1c-faucet
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory with your configuration:
```env
NEXT_PUBLIC_SOLANA_FAUCET_PK=[your-faucet-private-key]
NEXT_PUBLIC_SOLANA_TOKEN_MINT_ACCOUNT=[your-token-mint-address]
NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=[your-rpc-url]
```

4. Install Solana dependencies:
```bash
npm install @solana/web3.js @solana/spl-token
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **User Input:** Users enter their Solana wallet address
2. **Validation:** The system validates the address format (44 characters)
3. **Token Account Check:** The faucet checks if the user has an associated token account for $D1C
4. **Account Creation:** If no token account exists, one is automatically created
5. **Token Transfer:** 100 $D1C tokens are sent from the faucet to the user's address
6. **Confirmation:** User receives confirmation with transaction signature

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SOLANA_FAUCET_PK` | Private key of the faucet account (JSON array format) | Yes |
| `NEXT_PUBLIC_SOLANA_TOKEN_MINT_ACCOUNT` | Public key of the $D1C token mint | Yes |
| `NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL` | Solana RPC endpoint (defaults to devnet) | No |

## API Endpoints

### POST `/api/faucet`

Sends 100 $D1C tokens to the specified Solana address.

**Request Body:**
```json
{
  "address": "Solana wallet address"
}
```

**Response:**
```json
{
  "success": true,
  "signature": "transaction_signature"
}
```