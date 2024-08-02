'use client';

import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { PublicKey } from '@solana/web3.js';
import {
  useEscrowProgram,
  useEscrowProgramAccount,
} from './escrow-data-access';
import { useWallet } from '@solana/wallet-adapter-react';


export function EscrowAccountList({ firstMint, firstMintAta}: { firstMint: PublicKey; firstMintAta: PublicKey;}) {
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
          {accounts.data?.map((account: any) => (
            <EscrowCard
              key={account.publicKey.toString()}
              account={account.publicKey}
              firstMints={firstMint!}
              firstMint={account.account.mintA.toString()}
              firstMintAta={firstMintAta!}
              tokendepositedAmount={account.account.deposit.toString()}
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

function EscrowCard({ account, firstMint, firstMintAta, tokendepositedAmount,firstMints }: { account: PublicKey; firstMint: PublicKey; firstMintAta: PublicKey; tokendepositedAmount:string; firstMints:PublicKey }) {
  const {
    accountQuery,
    refundFromEscrow,
  } = useEscrowProgramAccount({ account });

  const { publicKey } = useWallet();

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content shadow-lg rounded-lg p-6">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <div className="text-center space-y-4 flex flex-row gap-2">
           Escrow acc: <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
          </div>

          <div className="text-center space-y-4 flex flex-row gap-2">
           Token mint: <p>
              <ExplorerLink
                path={`account/${firstMint}`}
                label={ellipsify(firstMint.toString())}
              />
            </p>
          </div>

          <div className="text-center space-y-4 flex flex-row gap-2">
           vault Token Amount: <p>
              {tokendepositedAmount.trim()}
            </p>
          </div>

          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline btn-primary"
              onClick={() => refundFromEscrow.mutateAsync({ maker: publicKey!, firstMints, firstMintAta })}
              disabled={refundFromEscrow.isPending}
            >
              Refund from Escrow
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
