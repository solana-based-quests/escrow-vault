'use client';

import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useEscrowProgram,
  useEscrowProgramAccount,
} from './escrow-data-access';

import { useWallet } from '@solana/wallet-adapter-react';

export function EscrowCreate() {
  const { initializeEscrow } = useEscrowProgram();

  const { publicKey } = useWallet();
  const [deposit, setUserDeposit] = useState("");
  const [receive, setUserReceive] = useState("");

  const isDataValid = deposit.trim() !== "" && receive.trim() !== "";

  const handleSubmit = () => {
    if (isDataValid && publicKey) {
      initializeEscrow.mutateAsync({ deposit, receive, maker: publicKey });
    }
  }

  return (

    <div className='flex flex-col'>
      <input className='input input-borderd rounded-lg border border-gray-300 ml-3' type='string' value={deposit} onChange={(e) => setUserDeposit(e.target.value)} placeholder='add user deposit' />
      <input className='input input-borderd rounded-lg border border-gray-300 ml-3' type='string' value={receive} onChange={(e) => setUserReceive(e.target.value)} placeholder='add user receive' />

      <button
        className="btn btn-xs lg:btn-md btn-primary mt-3 ml-2"
        onClick={handleSubmit}
        disabled={initializeEscrow.isPending || !isDataValid}
      >
        make Escrow {initializeEscrow.isPending && '...'}
      </button>
    </div>
  );
}

export function EscrowAccountList() {
  const { accounts, getProgramAccount } = useEscrowProgram();

  if (getProgramAccount?.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account:any) => (
            <EscrowCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function EscrowCard({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    refundFromEscrow,
    takeFromEscrow
  } = useEscrowProgramAccount({ account });

  const { publicKey } = useWallet();




  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => refundFromEscrow.mutateAsync({ maker: publicKey! })}
              disabled={refundFromEscrow.isPending}
            >
              Refund from Escrow
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => takeFromEscrow.mutateAsync({ maker: publicKey! })}
              disabled={takeFromEscrow.isPending}
            >
              Take From Escrow
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
