#![cfg_attr(not(feature = "std"), no_std)]
/// Constants for Moereum runtime.

/// SS58 PREFIX.
pub const SS58_PREFIX: u8 = 42;

/// Default parachain ID.
pub const PARACHAIN_ID: u32 = 10086;

/// Module contains time constants.
pub mod time;

/// Module contains currency constants.
pub mod currency;
