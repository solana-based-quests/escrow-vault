import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, Connection, SystemProgram } from '@solana/web3.js';
import { EscrowVault } from '../target/types/escrow_vault';
import { BN } from '@coral-xyz/anchor';
import { randomBytes } from "crypto";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createAssociatedTokenAccount } from "@solana/spl-token";


describe('escrow', async() => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const connection = new Connection('devnet')

  const program = anchor.workspace.Counter as Program<EscrowVault>;

  const firstmintPubkey = Keypair.generate();

  const seed = new BN(randomBytes(8));

  const firstmintata = await createAssociatedTokenAccount(
    connection, // connection
    payer.payer, // fee payer
    firstmintPubkey.publicKey, // mint
    payer.publicKey // owner,
  );

  const escrow = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), payer.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
    program.programId
  )[0]

  const vault = getAssociatedTokenAddressSync(firstmintPubkey.publicKey, escrow, true, TOKEN_PROGRAM_ID)



  it('It create a Escrow acc', async () => {
    await program.methods.make(seed, new BN(8), new BN(4)).accounts({
      maker: payer.publicKey,
      mintA: firstmintPubkey,
      makerAtaA: firstmintata,
      escrow: escrow,
      vault: vault,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    }).rpc();
  });


  it('It refund from escrow acc', async () => {

    await program.methods.refund().accounts({
      maker: payer.publicKey,
      mintA: firstmintPubkey,
      makerAtaA: firstmintata,
      escrow: escrow,
      vault: vault,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    }).rpc();

  });

});
