// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import EscrowIDL from '../target/idl/anchor_escrow.json';
import type { AnchorEscrow } from '../target/types/anchor_escrow';

// Re-export the generated IDL and type
export { AnchorEscrow, EscrowIDL };

// The programId is imported from the program IDL.
export const Escrow_PROGRAM_ID = new PublicKey(EscrowIDL.address);

// This is a helper function to get the Escrow Anchor program.
export function getEscrowProgram(provider: AnchorProvider) {
  return new Program(EscrowIDL as AnchorEscrow, provider);
}

// This is a helper function to get the program ID for the Escrow program depending on the cluster.
export function getEscrowProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Escrow program on devnet and testnet.
      return new PublicKey('CdbVJdguReS1ij7ZrUyAbf8KBfMjT75jyhSCggtVrPon');
    case 'mainnet-beta':
    default:
      return Escrow_PROGRAM_ID;
  }
}
