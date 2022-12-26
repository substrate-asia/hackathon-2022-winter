// @ts-nocheck
import Version from 'types/Version';

const signerIsOutOfDate = (config, signerVersion) => {
  const minRequiredSignerVersion = new Version(config.MIN_REQUIRED_SIGNER_VERSION);
  return signerVersion && !signerVersion.gte(minRequiredSignerVersion);
};

export default signerIsOutOfDate;
