import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferCheckedInstruction, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import bs58 from 'bs58';
import { verifyRecaptcha } from '@/utils/recaptcha';

const FAUCET_PK = process.env.SOLANA_FAUCET_PK;
const TOKEN_MINT = process.env.NEXT_PUBLIC_SOLANA_TOKEN_MINT_ACCOUNT;
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || clusterApiUrl('devnet');

export async function POST(req: NextRequest) {
  try {
    const { address, recaptchaToken } = await req.json();
    
    // Verify recaptcha first
    if (!recaptchaToken) {
      return NextResponse.json({ error: 'Recaptcha token is required' }, { status: 400 });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json({ error: 'Recaptcha verification failed' }, { status: 400 });
    }

    // Validate address
    const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!SOLANA_ADDRESS_REGEX.test(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }
    
    if (!FAUCET_PK || !TOKEN_MINT) {
      return NextResponse.json({ error: 'Faucet not configured' }, { status: 500 });
    }

    const connection = new Connection(RPC_URL, 'confirmed');

    const faucetKeypair = Keypair.fromSecretKey(bs58.decode(FAUCET_PK));
    const mintAddress = new PublicKey(TOKEN_MINT);
    const recipient = new PublicKey(address);

    let associatedTokenAccount;
    try {
      // Get or create recipient's associated token account
      associatedTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        recipient,
        false, // allowOwnerOffCurve
        TOKEN_2022_PROGRAM_ID,
      );
    } catch (error) {
      console.error("Error creating recipient token account:", error);
      throw error;
    }
    let faucetTokenAccount;
    try {
      faucetTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        faucetKeypair.publicKey,
        false, // allowOwnerOffCurve
        TOKEN_2022_PROGRAM_ID,
      );
    } catch (error) {
      console.error("Error creating faucet token account:", error);
      throw error;
    }
    // Create transfer instruction (100 tokens, 9 decimals)
    const amount = 100 * 1_000_000_000;
    const transaction = new Transaction();
    try {
      await getAccount(connection, associatedTokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
    } catch (error) {
      console.error("Error getting associated token account:", error);
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        faucetKeypair.publicKey, // payer
        associatedTokenAccount, // associated token account
        recipient, // owner
        mintAddress, // mint
        TOKEN_2022_PROGRAM_ID,
      );
      transaction.add(createATAInstruction);
    }

    const transferInstruction = createTransferCheckedInstruction(
      faucetTokenAccount,
      mintAddress,
      associatedTokenAccount,
      faucetKeypair.publicKey,
      amount,
      9,
      [],
      TOKEN_2022_PROGRAM_ID
    );

    transaction.add(transferInstruction);

    try{
      const sig = await sendAndConfirmTransaction(connection, transaction, [faucetKeypair]);
      return NextResponse.json({ success: true, signature: sig });
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
} 