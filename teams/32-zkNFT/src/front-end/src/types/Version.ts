// @ts-nocheck
export default class Version {
  constructor(versionString) {
    const tokens = versionString.split('.');
    this.majorVersion = parseInt(tokens[0]);
    this.minorVersion = parseInt(tokens[1]);
    this.patchVersion = parseInt(tokens[2]);
  }

  gte(other) {
    if (this.majorVersion > other.majorVersion) {
      return true;
    } else if (
      this.majorVersion === other.majorVersion &&
      this.minorVersion > other.minorVersion
    ) {
      return true;
    } else if (
      this.majorVersion === other.majorVersion &&
      this.minorVersion === other.minorVersion &&
      this.patchVersion >= other.patchVersion
    ) {
      return true;
    }
    return false;
  }

  toString() {
    return `v${this.majorVersion}.${this.minorVersion}.${this.patchVersion}`;
  }
}
