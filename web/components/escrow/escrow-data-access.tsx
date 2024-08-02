'use client';

import { getEscrowProgram, getEscrowProgramId } from '@escrow/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { BN } from '@coral-xyz/anchor';
import { randomBytes } from "crypto";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { createMint, getAccount, createAssociatedTokenAccount, mintToChecked } from "@solana/spl-token";


const seed = new BN(randomBytes(8));

export function useEscrowProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  const programId = useMemo(
    () => getEscrowProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getEscrowProgram(provider);

  const accounts = useQuery({
    queryKey: ['Escrow', 'all', { cluster }],
    queryFn: () => program.account.escrow.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // maker 

  const initializeEscrow = useMutation({
    mutationKey: ['escrow', 'make_escrow', { cluster }],
    mutationFn: async ({ demosecretKey, deposit, maker, setFirstMint, setFirstMintAta}: { demosecretKey: string; deposit: string; maker: PublicKey; setFirstMint: any; setFirstMintAta: any;}) => {

      const feePayer = Keypair.fromSecretKey(
        bs58.decode(demosecretKey)
      );

      const firstmintPubkey = await createMint(
        connection, // conneciton
        feePayer, // fee payer
        maker, // mint authority
        maker, // freeze authority 
        8 // decimals
      );

      setFirstMint(firstmintPubkey);

     
      const firstmintata = await createAssociatedTokenAccount(
        connection, // connection
        feePayer, // fee payer
        firstmintPubkey, // mint
        maker // owner,
      );

      setFirstMintAta(firstmintata);


      const txhashforFirstMintto = await mintToChecked(
        connection, // connection
        feePayer, // fee payer
        firstmintPubkey, // mint
        firstmintata, // receiver (should be a token account)
        maker, // mint authority
        new BN(9999999999999), // amount. if your decimals is 8, you mint 10^8 for 1 token.
        8 // decimals
      );
    
      const dnum = Number(deposit);
     // const rnum = Number(receive);


      const escrow = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), maker.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
        program.programId
      )[0]

      const vault = getAssociatedTokenAddressSync(firstmintPubkey, escrow, true, TOKEN_PROGRAM_ID)

      return program.methods.make(seed, new BN(dnum)).accounts({
        maker: maker,
        mintA: firstmintPubkey,
        makerAtaA: firstmintata,
        escrow: escrow,
        vault: vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });


  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initializeEscrow
  }


}

export function useEscrowProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useEscrowProgram();

  const accountQuery = useQuery({
    queryKey: ['escrow', 'fetch', { cluster, account }],
    queryFn: () => program.account.escrow.fetch(account),
  });

  const refundFromEscrow = useMutation({
    mutationKey: ['escrow', 'refund_from_escrow', { cluster }],
    mutationFn: async ({ maker, firstMints, firstMintAta }: { maker: PublicKey; firstMints: PublicKey; firstMintAta: PublicKey }) => {

      const escrow = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), maker.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
        program.programId
      )[0]

      const vault = getAssociatedTokenAddressSync(firstMints, escrow, true, TOKEN_PROGRAM_ID)


      return program.methods.refund().accounts({
        maker: maker,
        mintA: firstMints,
        makerAtaA: firstMintAta,
        escrow: escrow,
        vault: vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }).rpc();

    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to refund from Escrow account'),
  });


  return {
    accountQuery,
    refundFromEscrow
  };
}
