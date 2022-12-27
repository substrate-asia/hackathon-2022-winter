import Cookie from "vue-cookies";
import { CHAIN_ID } from "@/config";
import { ethers } from 'ethers'

export default {
  namespaced: true,
  state: {
    ethers: null,
    account: Cookie.get("eth-account"),
    allAccounts: [],
    abis: {},
    chainId: -1,
    blockNum: null,
    nonce: null,
    readonlyProvider: null,
    // user deposit data
    
    // multicall get data

    // loading state
  },
  mutations: {
    saveEthers: (state, ethers) => {
      state.ethers = ethers;
    },
    saveAccount: (state, account) => {
      (state.account = account), Cookie.set("eth-account", account, "30d");
    },
    saveAllAccounts: (state, allAccounts) => {
      state.allAccounts = allAccounts;
    },
    saveAbi: (state, { name, abi }) => {
      state.abis[name] = abi;
    },
    saveChainId: (state, chainId) => {
      state.chainId = chainId;
    },
    saveBlockNum: (state, blockNum) => {
      state.blockNum = blockNum;
    },
    saveNonce: (state, nonce) => {
      state.nonce = nonce;
    },
    saveReadonlyProvider: (state, readonlyProvider) => {
      state.readonlyProvider = readonlyProvider;
    },
    saveChainId: (state, chainId) => {
      state.chainId = chainId
    }
  },
  getters: {
    isMainChain: (state) => {
      return parseInt(state.chainId) === parseInt(CHAIN_ID);
    },
  },
};
