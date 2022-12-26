// @ts-nocheck
import { base58Decode, validateAddress } from '@polkadot/util-crypto';

export const validatePrivateAddress = (address) => {
  try {
    const bytes = base58Decode(address);
    return bytes.length === 64;
  } catch (error) {
    return false;
  }
};

export const validatePublicAddress = (address) => {
  try {
    const isValid = validateAddress(address);
    return isValid;
  } catch (error) {
    return false;
  }
};
