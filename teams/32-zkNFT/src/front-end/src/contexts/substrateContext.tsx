// @ts-nocheck
import React, { useReducer, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import types from '../config/types.json';
import { useConfig } from './configContext';


const INIT_STATE = {
  socket: null,
  rpc: null,
  types: types,
  api: null,
  apiError: null,
  apiState: null,
  blockNumber: 0
};

const reducer = (state, action) => {
  switch (action.type) {
  case 'CONNECT_INIT':
    return { ...state, apiState: 'CONNECT_INIT' };

  case 'CONNECT_SUCCESS':
    return { ...state, api: action.payload, apiState: 'READY' };

  case 'CONNECT_ERROR':
    return { ...state, apiState: 'ERROR', apiError: action.payload };

  case 'DISCONNECTED':
    if (state.provider === action.payload) {
      return { ...state, apiState: 'DISCONNECTED' };
    }
    return state;

  case 'UPDATE_BLOCK':
    return { ...state, blockNumber: action.payload };

  default:
    throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node

const connect = async (state, dispatch) => {
  const { socket, types, rpc } = state;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({
    provider,
    types,
    rpc
  });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    console.log('polkadot.js api connected');
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then(async () => {
      dispatch({ type: 'CONNECT_SUCCESS', payload: _api });
      await _api.rpc.chain.subscribeNewHeads((header) => {
        dispatch({ type: 'UPDATE_BLOCK', payload: header.number.toHuman() });
      });
    });
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
  _api.on('error', (err) => dispatch({ type: 'CONNECT_ERROR', payload: err }));
  _api.on('disconnected', () =>
    dispatch({ type: 'DISCONNECTED', payload: provider })
  );
};

const SubstrateContext = React.createContext();

const SubstrateContextProvider = ({children}) => {
  const config = useConfig();
  const initState = {
    ...INIT_STATE,
    socket: config.PROVIDER_SOCKET,
    rpc: config.RPC
  };
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    connect(state, dispatch);
  }, []);

  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  );
};

SubstrateContextProvider.propTypes = {
  children: PropTypes.any
};

const useSubstrate = () => ({ ...useContext(SubstrateContext) });

export { SubstrateContextProvider, useSubstrate };
