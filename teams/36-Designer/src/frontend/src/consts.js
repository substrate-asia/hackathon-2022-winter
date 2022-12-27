import metaWasm from "./wasm/de_signer.meta.wasm";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS ,
  programId: process.env.REACT_APP_PROGRAM_ID,
  metadata:metaWasm,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
};

export { ADDRESS, LOCAL_STORAGE };
