// @ts-nocheck
import { useNft } from "contexts/nftContext";
import classNames from 'classnames';
import NftItem from "./NftItem";
import { usePrivateWallet } from "contexts/privateWalletContext";
import DotLoader from "components/Loaders/DotLoader";

const ViewNfts = () => {

  const { allOwnedPublicNFTs, allOwnedPrivateNFTs } = useNft();
  const { sdk } = usePrivateWallet();

  return (
  <>
    <div className={classNames('text-center')}>
      <h1 className={classNames('text-white text-2xl pb-5')}>Your Public NFTs</h1>
      <div className={classNames('w-90 h-72 pl-3 pt-1 manta-bg-gray outline-none rounded-2xl overflow-y-scroll')}>
        {sdk ? allOwnedPublicNFTs.map(function(item, i) {
          return(<NftItem
            key={i}
            collectionId={item.collectionId}
            itemId={item.itemId}
            assetId={item.assetId}
            metadata={item.metadata.data}
          />) }) : <DotLoader/>}
      </div>
      <br/>
      <hr></hr>
      <br/>
      <h1 className={classNames('text-white text-2xl pb-5')}>Your Private NFTs</h1>
      <div className={classNames('w-90 h-72 pl-3 pt-1 manta-bg-gray outline-none rounded-2xl overflow-y-scroll')}>
      {sdk ? allOwnedPrivateNFTs.map(function(item, i) {
          return(<NftItem
            key={i}
            collectionId={item.collectionId}
            itemId={item.itemId}
            assetId={item.assetId}
            metadata={item.metadata.data}
          />) }) : <DotLoader/>}
      </div>
    </div>
  </>
  )
}

export default ViewNfts;