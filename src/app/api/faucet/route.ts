import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const FAUCET_PK = process.env.NEXT_PUBLIC_SOLANA_FAUCET_PK;
const TOKEN_MINT = process.env.NEXT_PUBLIC_SOLANA_TOKEN_MINT_ACCOUNT;
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || clusterApiUrl('devnet');

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address || address.length !== 44) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }
    if (!FAUCET_PK || !TOKEN_MINT) {
      return NextResponse.json({ error: 'Faucet not configured' }, { status: 500 });
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const faucetKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(FAUCET_PK))
    );
    const mint = new PublicKey(TOKEN_MINT);
    const recipient = new PublicKey(address);

    // Get or create recipient's associated token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      mint,
      recipient
    );

    // Get faucet's associated token account
    const faucetTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      mint,
      faucetKeypair.publicKey
    );

    // Create transfer instruction (100 tokens, 9 decimals)
    const amount = 100 * 1_000_000_000;
    const tx = new Transaction().add(
      createTransferInstruction(
        faucetTokenAccount.address,
        recipientTokenAccount.address,
        faucetKeypair.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [faucetKeypair]);
    return NextResponse.json({ success: true, signature: sig });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
} 