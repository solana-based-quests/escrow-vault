'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useEscrowProgram } from './escrow-data-access';
import { EscrowAccountList } from './escrow-ui';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';


export default function EscrowFeature() {
  const { publicKey } = useWallet();
  const { programId } = useEscrowProgram();

  // escrow create functionality
  const { initializeEscrow } = useEscrowProgram();

  const [deposit, setUserDeposit] = useState("");
  const [receive, setUserReceive] = useState("");
  const [demosecretKey, setDemoSecretKey] = useState<string>('');

  const [firstMint, setFirstMint] = useState<PublicKey>();
  const [firstMintAta, setFirstMintAta] = useState<PublicKey>();

  const isDataValid = deposit.trim() !== "" && receive.trim() !== "";

  const handleSubmit = () => {
    if (isDataValid && publicKey) {
      initializeEscrow.mutateAsync({ demosecretKey, deposit, receive, maker: publicKey, setFirstMint, setFirstMintAta });
    }
  }


  return publicKey ? (
    <div>
      <AppHero
        title="Escrow"
        subtitle={
          'Create a new Escrow account by clicking the "Create Escrow" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (make and refund).'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>

        {/**escrow create start */}
        <div className='flex flex-col space-y-4 p-4 max-w-md mx-auto bg-white shadow-md rounded-lg'>
          <input
            className='input input-bordered rounded-lg border border-gray-300 p-2'
            type='text'
            value={demosecretKey}
            onChange={(e) => setDemoSecretKey(e.target.value)}
            placeholder='Add demo wallet secret key'
          />
          <input
            className='input input-bordered rounded-lg border border-gray-300 p-2'
            type='text'
            value={deposit}
            onChange={(e) => setUserDeposit(e.target.value)}
            placeholder='Add user deposit'
          />
          <input
            className='input input-bordered rounded-lg border border-gray-300 p-2'
            type='text'
            value={receive}
            onChange={(e) => setUserReceive(e.target.value)}
            placeholder='Add user receive'
          />
          <button
            className='btn btn-secondary mt-3 px-4 py-2 rounded-lg disabled:opacity-99'
            onClick={handleSubmit}
            disabled={initializeEscrow.isPending || !isDataValid}
          >
            Create Escrow {initializeEscrow.isPending && '...'}
          </button>
        </div>
        {/**here escrow create end */}

      </AppHero>
      <EscrowAccountList firstMint={firstMint!} firstMintAta={firstMintAta!} />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
