// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import EscrowIDL from '../target/idl/escrow_vault.json';
import type { EscrowVault } from '../target/types/escrow_vault';

// Re-export the generated IDL and type
export { EscrowVault, EscrowIDL };

// The programId is imported from the program IDL.
export const Escrow_PROGRAM_ID = new PublicKey(EscrowIDL.address);

// This is a helper function to get the Escrow Anchor program.
export function getEscrowProgram(provider: AnchorProvider) {
  return new Program(EscrowIDL as EscrowVault, provider);
}

// This is a helper function to get the program ID for the Escrow program depending on the cluster.
export function getEscrowProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Escrow program on devnet and testnet.
      return new PublicKey('532hd4Thge8xrp15FA7xnnn3GVZwcETVFE9nW85NBd4P');
    case 'mainnet-beta':
    default:
      return Escrow_PROGRAM_ID;
  }
}
