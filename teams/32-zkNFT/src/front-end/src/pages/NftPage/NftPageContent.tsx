// @ts-nocheck
import React, { useEffect } from 'react';
import PageContent from 'components/PageContent';
import Svgs from 'resources/icons';
import { showError, showSuccess } from 'utils/ui/Notifications';
import { useTxStatus } from 'contexts/txStatusContext';
import MissingRequiredSoftwareModal from 'components/Modal/missingRequiredSoftwareModal';
import signerIsOutOfDate from 'utils/validation/signerIsOutOfDate';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import NewerSignerVersionRequiredModal from 'components/Modal/newerSignerVersionRequiredModal';
import { useConfig } from 'contexts/configContext';
import DowntimeModal from 'components/Modal/downtimeModal';
import MobileNotSupportedModal from 'components/Modal/mobileNotSupported';
import userIsMobile from 'utils/ui/userIsMobile';
import { useKeyring } from 'contexts/keyringContext';
import NftCreatePageContent from '../NftCreatePage/NftCreatePageContent';
import NftTransactPageContent from '../NftTransactPage/NftTransactPageContent';
import NftViewPageContent from '../NftViewPage/NftViewPageContent';
import { useNft } from "contexts/nftContext";

const CREATE = "CREATE";
const TRANSACT = "TRANSACT";
const VIEW = "VIEW";

const NftPageContent = () => {
  const { keyring } = useKeyring();
  const { txStatus } = useTxStatus();
  const { signerVersion } = usePrivateWallet();
  const config = useConfig();

  const { currentPage } = useNft();

  useEffect(() => {
    if (keyring) {
      keyring.setSS58Format(config.SS58_FORMAT);
    }
  }, [keyring]);

  document.title = config.PAGE_TITLE;

  useEffect(() => {
    if (txStatus?.isFinalized()) {
      showSuccess(config, 'Transaction succeeded', txStatus?.extrinsic);
    } else if (txStatus?.isFailed()) {
      showError('Transaction failed');
    }
  }, [txStatus]);

  let warningModal = <div />;
  if (config.DOWNTIME) {
    warningModal = <DowntimeModal />;
  } else if (userIsMobile()) {
    warningModal = <MobileNotSupportedModal />;
  } else if (signerIsOutOfDate(config, signerVersion)) {
    warningModal = <NewerSignerVersionRequiredModal />;
  } else {
    warningModal = <MissingRequiredSoftwareModal />;
  }

  return (
    <PageContent>
      {warningModal}
      {(currentPage === CREATE) && <NftCreatePageContent/>}
      {(currentPage === TRANSACT) && <NftTransactPageContent/>}
      {(currentPage === VIEW) && <NftViewPageContent/>}
    </PageContent>
  );
};

export default NftPageContent;
