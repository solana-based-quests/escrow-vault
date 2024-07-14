'use client';

import { getEscrowProgram, getEscrowProgramId } from '@escrow/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { BN } from '@coral-xyz/anchor';
import { randomBytes } from "crypto";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";


const mint_a = new PublicKey("7XHomc5Tpjtcffcr5KPY9YESfYigwpMJQ9CPKNjKKphi"); // 9bRS4potSUSRFPU2aRiHCnDPMngsTtT75vjad8U1kqBL  ata
const mint_b = new PublicKey("AMuwCWGT79K7B7FSPeXmswFwSDoCXqNMF5kyFk8AbWvS"); // GvRXqHKasigbbyhMctyW7zFSMUAmTbvNAoWG9iSQ7FEx ata


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

  console.log("acc", accounts)

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // maker 

  const initializeEscrow = useMutation({
    mutationKey: ['escrow', 'make_escrow', { cluster }],
    mutationFn: async ({ deposit, receive, maker }: { deposit: string; receive: string; maker: PublicKey }) => {

      const seed = new BN(randomBytes(8));

      const dnum = Number(deposit);
      const rnum = Number(receive);


      return program.methods.make(seed, new BN(dnum), new BN(rnum)).accounts({
        maker: maker,
        mintA: mint_a,
        mintB: mint_b,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
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
    initializeEscrow,
  };
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
    mutationFn: async ({ maker }: { maker: PublicKey }) => {
      return program.methods.refund().rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to refund from Escrow account'),
  });


  const takeFromEscrow = useMutation({
    mutationKey: ['escrow', 'take_from_escrow', { cluster }],
    mutationFn: async ({ maker }: { maker: PublicKey }) => {
      return program.methods.take().rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to take from Escrow account'),
  });


  return {
    accountQuery,
    refundFromEscrow,
    takeFromEscrow
  };
}
