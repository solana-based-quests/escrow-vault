use anchor_lang::prelude::*;

pub mod contexts;
use contexts::*;

pub mod state;
pub use state::*;

declare_id!("3R1JYpXixqemMmWZ9rh2kQZnuPNvPgm2Zn3TY8AB5svH");

#[program]
pub mod escrow_vault {
    use super::*;

    // make an escrow

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64) -> Result<()> {
        ctx.accounts.deposit(deposit)?;
        ctx.accounts.save_escrow(seed, deposit, &ctx.bumps)
    }

    // just refund your tokens from escrow

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()
    }
}
