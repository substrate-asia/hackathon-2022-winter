// @ts-nocheck
import classNames from 'classnames';
const NftItem = ({
  collectionId,
  itemId,
  assetId,
  metadata
}) => {

  const IPFS_URL = "https://ipfs.io/ipfs/";

  return (
  <>
    <div className={classNames('pb-3 pt-3 bg-secondary rounded-3xl mr-6 ml-6 mt-6 mb-6')}>
      <img className={classNames('w-36 h-36 pb-3 inline-block')} src={IPFS_URL+metadata} alt={"Unable to load image from IPFS"}/>
      <h4 className={classNames('text-white')}>{"Collection ID: "+collectionId}</h4>
      <h4 className={classNames('text-white')}>{"Item ID: "+itemId}</h4>
      <h4 className={classNames('text-white')}>{"Asset ID: "+assetId}</h4>
    </div>
  </>
  )
}

export default NftItem;