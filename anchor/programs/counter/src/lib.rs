use anchor_lang::prelude::*;

pub mod contexts;
use contexts::*;

pub mod state;
pub use state::*;

declare_id!("CdbVJdguReS1ij7ZrUyAbf8KBfMjT75jyhSCggtVrPon");

#[program]
pub mod anchor_escrow {
    use super::*;

    // make an escrow

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64, receive: u64) -> Result<()> {
        ctx.accounts.deposit(deposit)?;
        ctx.accounts.save_escrow(seed, receive, &ctx.bumps)
    }

    // just refund your tokens from escrow

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()
    }
}
