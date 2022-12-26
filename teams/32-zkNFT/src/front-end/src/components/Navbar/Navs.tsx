import NETWORK from 'constants/NetworkConstants';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSubstrate } from 'contexts/substrateContext';
import { useConfig } from 'contexts/configContext';
import { useNft } from 'contexts/nftContext';

const CREATE = "CREATE";
const TRANSACT = "TRANSACT";
const VIEW = "VIEW";

const Navs = () => {
  const config = useConfig();
  const { socket } = useSubstrate();
  const nodes = config.NODES;
  const activeNode = nodes.find((node: any) => node.url === socket);

  return (
    <>
      {activeNode.name !== NETWORK.CALAMARI ? (
        <div className="flex rounded-full bg-secondary shadow-2xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <NavLink
            to="/transact"
            className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white"
          >
            Transact
          </NavLink>
          <NavLink
            to="/bridge"
            className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white"
          >
            Bridge
          </NavLink>
          <NavLink
            to="/stake"
            className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white"
          >
            Stake
          </NavLink>
          <a
            href="https://docs.manta.network/docs/calamari/Governance"
            className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white"
            target="_blank" rel="noreferrer"
          >
            Govern
          </a>
        </div>
      ) : null}
    </>
  );
};

export const NFTNavs = () => {

  const { currentPage, setCurrentPage } = useNft();

  const setCreate = () => {
    if (currentPage !== CREATE) {
      setCurrentPage(CREATE);
    }
  }

  const setTransact = () => {
    if (currentPage !== TRANSACT) {
      setCurrentPage(TRANSACT);
    }
  }

  const setView = () => {
    if (currentPage !== VIEW) {
      setCurrentPage(VIEW);
    }
  }

  return (
    <>
        <div className="flex rounded-full bg-secondary shadow-2xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <button onClick={setCreate} className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white">Create</button>
          <button onClick={setTransact}className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white">Transact</button>
          <button onClick={setView}className="px-6 py-3 font-medium rounded-full text-secondary hover:bg-white">View</button>
        </div>
    </>
  );
}

export default Navs;
