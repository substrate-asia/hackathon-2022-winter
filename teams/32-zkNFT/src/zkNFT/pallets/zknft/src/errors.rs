use manta_accounting::transfer;
use manta_accounting::transfer::{InvalidAuthorizationSignature, InvalidSinkAccount, InvalidSourceAccount};
use manta_accounting::transfer::receiver::ReceiverPostError;
use manta_accounting::transfer::sender::SenderPostError;
use manta_pay::config;
use manta_primitives::assets;
use manta_primitives::types::StandardAssetId;
use crate::{Config, Error};
use crate::types::AssetValue;

/// Fungible Ledger Error
pub type FungibleLedgerError = assets::FungibleLedgerError<StandardAssetId, AssetValue>;

impl<T> From<InvalidAuthorizationSignature> for Error<T>
    where
        T: Config,
{
    #[inline]
    fn from(_: InvalidAuthorizationSignature) -> Self {
        Self::InvalidAuthorizationSignature
    }
}

impl<T> From<InvalidSourceAccount<config::Config, T::AccountId>> for Error<T>
    where
        T: Config,
{
    #[inline]
    fn from(_: InvalidSourceAccount<config::Config, T::AccountId>) -> Self {
        Self::InvalidSourceAccount
    }
}

impl<T> From<InvalidSinkAccount<config::Config, T::AccountId>> for Error<T>
    where
        T: Config,
{
    #[inline]
    fn from(_: InvalidSinkAccount<config::Config, T::AccountId>) -> Self {
        Self::InvalidSinkAccount
    }
}

impl<T> From<SenderPostError> for Error<T> {
    #[inline]
    fn from(err: SenderPostError) -> Self {
        match err {
            SenderPostError::AssetSpent => Self::AssetSpent,
            SenderPostError::InvalidUtxoAccumulatorOutput => Self::InvalidUtxoAccumulatorOutput,
        }
    }
}

impl<T> From<ReceiverPostError> for Error<T> {
    #[inline]
    fn from(err: ReceiverPostError) -> Self {
        match err {
            ReceiverPostError::AssetRegistered => Self::AssetRegistered,
        }
    }
}

impl<T> From<FungibleLedgerError> for Error<T>
    where
        T: Config,
{
    #[inline]
    fn from(err: FungibleLedgerError) -> Self {
        match err {
            FungibleLedgerError::InvalidAssetId(_) => Self::PublicUpdateInvalidAssetId,
            FungibleLedgerError::BelowMinimum => Self::PublicUpdateBelowMinimum,
            FungibleLedgerError::CannotCreate => Self::PublicUpdateCannotCreate,
            FungibleLedgerError::UnknownAsset => Self::PublicUpdateUnknownAsset,
            FungibleLedgerError::Overflow => Self::PublicUpdateOverflow,
            FungibleLedgerError::CannotWithdrawMoreThan(_) => Self::PublicUpdateCannotWithdraw,
            FungibleLedgerError::InvalidMint(_) => Self::PublicUpdateInvalidMint,
            FungibleLedgerError::InvalidBurn(_) => Self::PublicUpdateInvalidBurn,
            FungibleLedgerError::InvalidTransfer(_) => Self::PublicUpdateInvalidTransfer,
            FungibleLedgerError::EncodeError => Self::EncodeError,
        }
    }
}

/// Transfer Post Error
pub type TransferPostError<T> = transfer::TransferPostError<
    config::Config,
    <T as frame_system::Config>::AccountId,
    FungibleLedgerError,
>;

impl<T> From<TransferPostError<T>> for Error<T>
    where
        T: Config,
{
    #[inline]
    fn from(err: TransferPostError<T>) -> Self {
        match err {
            TransferPostError::<T>::InvalidShape => Self::InvalidShape,
            TransferPostError::<T>::InvalidAuthorizationSignature(err) => err.into(),
            TransferPostError::<T>::InvalidSourceAccount(err) => err.into(),
            TransferPostError::<T>::InvalidSinkAccount(err) => err.into(),
            TransferPostError::<T>::Sender(err) => err.into(),
            TransferPostError::<T>::Receiver(err) => err.into(),
            TransferPostError::<T>::DuplicateMint => Self::DuplicateRegister,
            TransferPostError::<T>::DuplicateSpend => Self::DuplicateSpend,
            TransferPostError::<T>::InvalidProof => Self::InvalidProof,
            TransferPostError::<T>::UpdateError(err) => err.into(),
        }
    }
}