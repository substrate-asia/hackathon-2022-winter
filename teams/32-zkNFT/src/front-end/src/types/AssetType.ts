// @ts-nocheck
import Svgs from 'resources/icons';
import BN from 'bn.js';

export default class AssetType {
  constructor(
    assetId,
    baseName,
    baseTicker,
    icon,
    numberOfDecimals,
    publicExistentialDeposit,
    isPrivate,
    isNativeToken = false
  ) {
    this.assetId = assetId;
    this.baseName = baseName;
    this.baseTicker = baseTicker;
    this.name = AssetType._getFullName(baseName, isPrivate);
    this.ticker = AssetType._getFullTicker(baseTicker, isPrivate);
    this.icon = icon;
    this.numberOfDecimals = numberOfDecimals;
    this.publicExistentialDeposit = publicExistentialDeposit;
    this.existentialDeposit = isPrivate ? new BN(0) : publicExistentialDeposit;
    this.isPrivate = isPrivate;
    this.isNativeToken = isNativeToken;
  }

  static Native(config) {
    if (config.NETWORK_NAME === 'Calamari') {
      return AssetType.Calamari(false);
    } else {
      return AssetType.Dolphin(false);
    }
  }

  static Nft(isPrivate, assetId) {
    return new AssetType(
      assetId,
      'NFT',
      "NFT",
      null,
      12,
      new BN('1000000000000'),
      isPrivate
    )
  }

  static Dolphin(isPrivate) {
    return new AssetType(
      1,
      'Dolphin',
      'DOL',
      Svgs.Dolphin,
      18,
      new BN('100000000000000000'),
      isPrivate,
      true
    );
  }

  static Calamari(isPrivate) {
    return new AssetType(
      1,
      'Calamari',
      'KMA',
      Svgs.Calamari,
      12,
      new BN('100000000000'),
      isPrivate,
      true
    );
  }

  static Karura(isPrivate) {
    return new AssetType(
      8,
      'Karura',
      'KAR',
      Svgs.KarIcon,
      12,
      new BN('100000000000'),
      isPrivate
    );
  }

  static AcalaDollar(isPrivate) {
    return new AssetType(
      9,
      'Acala Dollar',
      'aUSD',
      Svgs.AusdIcon,
      12,
      new BN('10000000000'),
      isPrivate
    );
  }

  static Kusama(isPrivate) {
    return new AssetType(
      10,
      'Kusama',
      'KSM',
      Svgs.KusamaIcon,
      12,
      new BN('500000000'),
      isPrivate
    );
  }

  static Rococo(isPrivate) {
    return new AssetType(
      11,
      'Rococo',
      'ROC',
      Svgs.RocIcon,
      12,
      new BN('1'),
      isPrivate
    );
  }

  static KintsugiBTC(isPrivate) {
    return new AssetType(
      12,
      'Kintsugi BTC',
      'kBTC',
      Svgs.KbtcIcon,
      8,
      new BN('1'),
      isPrivate
    );
  }

  static Moonriver(isPrivate) {
    return new AssetType(
      13,
      'Moonriver',
      'MOVR',
      Svgs.MovrIcon,
      18,
      new BN('10000000000000000'),
      isPrivate
    );
  }

  static AllCurrencies(isPrivate) {
    return [
      AssetType.Nft(isPrivate,0)
    ];
  }

  static _getFullName(baseName, isPrivate) {
    return isPrivate ? `Test Private ${baseName}` : `Test ${baseName}`;
  }

  static _getFullTicker(baseTicker, isPrivate) {
    return isPrivate ? `p${baseTicker}` : baseTicker;
  }

  toPrivate() {
    return new AssetType(
      this.assetId,
      this.baseName,
      this.baseTicker,
      this.icon,
      this.numberOfDecimals,
      this.publicExistentialDeposit,
      true,
      this.isNativeToken
    );
  }

  toPublic() {
    return new AssetType(
      this.assetId,
      this.baseName,
      this.baseTicker,
      this.icon,
      this.numberOfDecimals,
      this.publicExistentialDeposit,
      false,
      this.isNativeToken
    );
  }

  toggleIsPrivate() {
    if (this.isPrivate) {
      return this.toPublic();
    } else {
      return this.toPrivate();
    }
  }
}
