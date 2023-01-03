// @ts-nocheck
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faTimes,
  faAngleDown,
  faAngleUp,
  faLink
} from '@fortawesome/free-solid-svg-icons';
import { useSubstrate } from 'contexts/substrateContext';
import Svgs from 'resources/icons';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useConfig } from 'contexts/configContext';
import { useTxStatus } from 'contexts/txStatusContext';


const ChainDropdownItem = ({ node, activeNode }) => {
  const { apiState } = useSubstrate();
  const nodeIsDisconnected = apiState === 'ERROR' || apiState === 'DISCONNECTED';
  const [disconnectedIndicator, setDisconnectedIndicator] = useState(nodeIsDisconnected);

  useEffect(() => {
    let timeout;
    if (nodeIsDisconnected) {
      timeout = setTimeout(() => {
        if (nodeIsDisconnected) {
          setDisconnectedIndicator(true);
        }
      }, 1000);
    } else {
      timeout && clearTimeout(timeout);
      setDisconnectedIndicator(false);
    }
  }, [apiState]);

  ChainDropdownItem.propTypes = {
    node: PropTypes.object,
    activeNode: PropTypes.object,
  };

  return (
    <Link to={node.path}>
      <div
        className={`px-8 py-4 font-bold text-lg text-black dark:text-white cursor-pointer hover:bg-thirdry ${
          activeNode.name === node.name ? 'bg-thirdry' : ''
        }`}
        key={node.name}
      >
        <div className="flex items-center gap-2 w-full">
          <img
            className={classNames('w-8 h-8', {'rounded-full': node.name === 'Calamari'})}
            src={Svgs[node.name]}
            alt={node.name}
          />
          <div>
            {node.name}&nbsp;
            {node.testnet ? 'testnet' : ''}
          </div>
          {activeNode.name === node.name ? (
            <div className="ml-auto">
              {disconnectedIndicator ? (
                <FontAwesomeIcon icon={faTimes} color="#FA4D56" />
              ) : apiState === 'READY' ? (
                <FontAwesomeIcon icon={faCheck} color="#24A148" />
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="spinner-border animate-spin inline-block w-4 h-4 border-1 rounded-full"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {activeNode.name === node.name ? (
          <div className="mt-2 ml-2 flex items-center justify-between text-black dark:text-white font-normal text-base">
            {node.explorer}
            <a href={`https://${node.explorer}`} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faLink} />
            </a>
          </div>
        ) : null}
      </div>
    </Link>
  );
};

const ChainSelector = () => {
  const config = useConfig();
  const { socket } = useSubstrate();
  const { txStatus } = useTxStatus();

  const nodes = config.NODES;
  const activeNode = nodes.find((node) => node.url === socket);
  const [showNetworkList, setShowNetworkList] = useState(false);

  const disabled = txStatus?.isProcessing();
  const onClickChainSelector = () => !disabled && setShowNetworkList(true);

  return (
    <OutsideClickHandler onOutsideClick={() => setShowNetworkList(false)}>
      <div className="relative" onClick={onClickChainSelector}>
        <div
          className={classNames(
            'logo-content hidden items-center lg:flex relative cursor-pointer',
            { disabled: disabled }
          )}
        >
          <div className="logo border-white w-14 h-14">
            <img
              className={classNames({'rounded-full': activeNode.name === 'Calamari'})}
              src={Svgs[activeNode.name]}
              alt={activeNode.name}
            />
          </div>
          <div>
            <h1 className="text-3xl mb-0 pl-2 font-semibold text-accent">
              {activeNode.name}&nbsp;{activeNode.testnet ? 'testnet' : ''}
            </h1>
          </div>
          <div className="text-black dark:text-white text-lg ml-4">
            <FontAwesomeIcon icon={showNetworkList ? faAngleUp : faAngleDown} />
          </div>
        </div>
        {showNetworkList && (
          <div className="absolute border border-secondary rounded-2xl bg-secondary top-full z-50 w-72 mt-4 overflow-hidden">
            <div className="px-8 py-4 font-bold text-lg text-secondary">
              Select Network
            </div>
            {nodes.map((node) => (
              <ChainDropdownItem key={node.name} node={node} activeNode={activeNode} />
            ))}
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default ChainSelector;
