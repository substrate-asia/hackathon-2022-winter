// @ts-nocheck
import store from 'store';

const LAST_ACCOUNT_STORAGE_KEY = 'lastAccessedExternalAccountAddress';

export const getLastAccessedExternalAccount = (config, keyring) => {
  const lastAccountAddress = store.get(
    `${config.BASE_STORAGE_KEY}${LAST_ACCOUNT_STORAGE_KEY}`);

  if (!lastAccountAddress) {
    return null;
  }
  // Validate that account is still in user's keychain
  try {
    return keyring.getPair(lastAccountAddress);
  } catch (error) {
    return null;
  }
};

export const setLastAccessedExternalAccountAddress = (config, lastAccount) => {
  store.set(
    `${config.BASE_STORAGE_KEY}${LAST_ACCOUNT_STORAGE_KEY}`, lastAccount);
};
