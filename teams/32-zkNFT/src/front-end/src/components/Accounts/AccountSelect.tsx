// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Identicon from '@polkadot/react-identicon';
import OutsideClickHandler from 'react-outside-click-handler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faCopy,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useExternalAccount } from 'contexts/externalAccountContext';
import Button from 'components/Button';
import PolkadotIcon from 'resources/icons/chain/polkadot.svg';
import { useModal } from 'hooks';
import ConnectWalletModal from 'components/Modal/connectWallet';
import { useConfig } from 'contexts/configContext';
import { useTxStatus } from 'contexts/txStatusContext';
import classNames from 'classnames';

const AccountSelect = () => {
  const config = useConfig();
  const { txStatus } = useTxStatus();
  const { externalAccount, externalAccountOptions, changeExternalAccount } = useExternalAccount();
  const { ModalWrapper, showModal } = useModal();

  const [showAccountList, setShowAccountList] = useState(false);
  const [addressCopied, setAddressCopied] = useState(-1);
  const disabled = txStatus?.isProcessing();

  const copyToClipboard = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setAddressCopied(index);
    return false;
  };

  useEffect(() => {
    const timer = setTimeout(
      () => addressCopied >= 0 && setAddressCopied(-1),
      2000
    );
    return () => clearTimeout(timer);
  }, [addressCopied]);

  const getBlockExplorerLink = (address) => {
    return `${config.SUBSCAN_URL}/account/${address}`;
  };

  const onClickAccountSelect = () => {
    !disabled && setShowAccountList(!showAccountList);
  };

  return (
    <div>
      {externalAccount ? (
        <div className="relative">
          <OutsideClickHandler onOutsideClick={() => setShowAccountList(false)}>
            <div
              className={classNames(
                'flex gap-3 py-3 p-6 bg-secondary text-secondary',
                'font-medium cursor-pointer rounded-xl',
                {'disabled': disabled}
              )}
              onClick={onClickAccountSelect}
            >
              <img className="w-6 h-6" src={PolkadotIcon} alt="Polkadot" />
              {externalAccount.meta.name}
            </div>
            {showAccountList ? (
              <div className="mt-3 bg-secondary rounded-3xl p-6 pr-2 absolute right-0 top-full z-50 border border-manta-gray">
                <div className="max-h-96 overflow-y-auto pr-4">
                  {externalAccountOptions.map((account: any, index: number) => (
                    <div
                      key={account.address}
                      className="flex items-center gap-5 justify-between border border-secondary rounded-xl px-6 py-4 mb-5 text-secondary"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <Identicon
                            value={account.address}
                            size={32}
                            theme="polkadot"
                          />
                          {account.meta.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            onClick={() => {
                              changeExternalAccount(account);
                              setShowAccountList(false);
                            }}
                          >
                            {`${account.address.slice(
                              0,
                              4
                            )}...${account.address.slice(-5)}`}
                          </div>
                          <a
                            href={getBlockExplorerLink(account.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FontAwesomeIcon
                              className="cursor-pointer"
                              icon={faArrowUpRightFromSquare}
                              href={getBlockExplorerLink(account.address)}
                            />
                          </a>
                          {addressCopied === index ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : (
                            <FontAwesomeIcon
                              className="cursor-pointer"
                              icon={faCopy}
                              onClick={() =>
                                copyToClipboard(account.address, index)
                              }
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className="border-2 font-semibold border-secondary text-link rounded-full py-1 px-2 cursor-pointer"
                        onClick={() => {
                          changeExternalAccount(account);
                          setShowAccountList(false);
                        }}
                      >
                        Change
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </OutsideClickHandler>
        </div>
      ) : (
        <>
          <Button
            className="btn-secondary rounded-lg relative z-10"
            onClick={showModal}
          >
            Connect Wallet
          </Button>
          <ModalWrapper>
            <ConnectWalletModal />
          </ModalWrapper>
        </>
      )}
    </div>
  );
};

export default AccountSelect;
