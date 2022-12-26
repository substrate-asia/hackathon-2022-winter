// @ts-nocheck

const extrinsicWasSentByUser = (extrinsic, userAccount, api) => {
  if (!api) {
    return null;
  }
  const userAccountId = api.createType('AccountId', userAccount.address).toString();
  const extrinsicAccountId = extrinsic.signer.toString();
  const res = userAccountId === extrinsicAccountId;
  return res;
};

export default extrinsicWasSentByUser;
