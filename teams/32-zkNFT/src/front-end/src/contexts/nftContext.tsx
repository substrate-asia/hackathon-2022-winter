// @ts-nocheck
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef
} from 'react';
import { usePrivateWallet } from './privateWalletContext';
import { showError, showSuccess } from 'utils/ui/Notifications';
import PropTypes from 'prop-types';
import { create } from "ipfs-http-client";
import { useTxStatus } from 'contexts/txStatusContext';

const NftContext = createContext();

const IPFS_URL = "https://ipfs.io/ipfs/";

const TEST2 = "";
// const TEST2 = "5DknaTvGdxGTT5yHQCgXhPdj6zgcjhnGuPYN9qVgNAGTVxZ7";

export const NftContextProvider = (props) => {

  const { sdk } = usePrivateWallet();

  const [ipfsClient, setIpfsClient] = useState(null);
  const [allOwnedPublicNFTs, setAllOwnedPublicNFTs] = useState([]);
  const [allOwnedPrivateNFTs, setAllOwnedPrivateNFTs] = useState([]);
  const [currentlyFetching,setCurrentlyFetching] = useState(false);

  const [currentPage, setCurrentPage] = useState("CREATE");
  
  useEffect(async () => {

    if (sdk && !currentlyFetching && currentPage === "VIEW") {
      await getAllOwnedNFTs();
    }

  },[sdk,currentPage]);

  useEffect(async () => {
    const projectId = "2JLWqhTvTCl9Zzx7Qi93w8WjqW2";
    const projectSecret = process.env.REACT_APP_IPFSSK;
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    const client = await create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      apiPath: '/api/v0',
      headers: {
        authorization: auth,
    },
    });
    setIpfsClient(client);

  },[]);

  /// creates a new collection, broadcasts the collectionId.
  const createCollection = async () => {

    if (!sdk) {
      console.log("SDK not initialized yet.")
      return;
    }
    try {

      const collectionId = await sdk.createCollection();

      console.log("NFT Collection created with CollectionID: ", collectionId);
      showSuccess({},"Collection ID: "+collectionId);

    } catch (e) {
      console.error(e)
      showError({},"Failed to create NFT collection");
    }
  }

  /// Mints a new NFT, broadcasts the NFT AssetId.
  /// Sets the metadata for the NFT to an IPFS CID.
  const mintNFT = async (collectionId, itemId, address="", metadata) => {
    if (!sdk) {
      console.log("SDK not initialized yet.")
      return;
    }
    try {

      const IPFS_CID = await uploadToIpfs(metadata);
      console.log("Successfully Uploaded to IPFS at " + IPFS_URL+IPFS_CID);
      const assetId = await sdk.mintNFTAndSetMetadata(collectionId,itemId,address,IPFS_CID);
      showSuccess({},"AssetID: " + assetId);
      console.log("NFT created with AssetID: ", assetId);
    } catch (e) {
      console.error(e)
      showError({},"Failed to create NFT");
    }
  }

  const uploadToIpfs = async (file) => {
    try {
      const created = await ipfsClient.add({ content: file });
      return created.path;   
    } catch (e) {
      console.log("Unable to upload image to IPFS");
      console.error(e);
    }
  }

  const getAllNFTsForCollection = async (collectionId, address="") => {
    try {
      const allNFTs = await sdk.viewAllNFTsInCollection(collectionId, address);
      return allNFTs;
    } catch (e) {
      console.log("Unable to get all NFTs for the Collection ID: ", collectionId);
      console.error(e);
    }
  }

  // converting each collectionId, itemId => assetId and then checking the
  // private balance of given assetId to see if we own the NFT.
  const checkPrivateNFTsForOwnership = async (privateNFTS) => {
    try {
      if (privateNFTS.length == "0") {
        return privateNFTS;
      }

      const owned = [];

      for (let i = 0; i < privateNFTS.length; i++) {
        const currentPrivateNFT = privateNFTS[i];
        const assetId = await sdk.assetIdFromCollectionAndItemId(currentPrivateNFT.collectionId, currentPrivateNFT.itemId);
        const assetIdArray = await sdk.numberToAssetIdArray(assetId);
        const privateBalance = await sdk.privateBalance(assetIdArray);
        console.log("NFT -> private asset id:" + assetId + ", balance:" + privateBalance);

        /// account owns the private NFT
        if (privateBalance == "1000000000000") {
          const nftWithAssetId = {...currentPrivateNFT, assetId};
          owned.push(nftWithAssetId);
        }

      }
      return owned;
    } catch (e) {
      console.error(e);
    }
  }

  // iterates over every single collection, gets all publicly owned items, and checks
  // if there is a private balance on all private items in collection. If there is a private
  // balance that means the account owns it so it will be added to the privateOwnedNFTs state.
  const getAllOwnedNFTs = async () => {
    try {

      if (currentlyFetching) {
        return;
      }
      setCurrentlyFetching(true);
      // if no collections exist we exit.
      const nextCollectionId = await sdk.api.query.uniques.nextCollectionId();
      if (nextCollectionId.toHuman() == "0") return;

      const allPublicOwnedNFTs = [];
      const allPrivateOwnedNFTs = [];

      for (let i = 0; i < nextCollectionId.toHuman(); i++) {

        const allNFTsInCollection = await getAllNFTsForCollection(i, TEST2);
        // add public NFTs if they exist

        if (allNFTsInCollection.publicOwnedNFTs.length) {

          // add assetId to each NFT item
          // also adds each item directly to allPublicOwnedNFTs, which flattens the 2D array making
          // it easier to display in the UI.
          for (let j = 0; j < allNFTsInCollection.publicOwnedNFTs.length; j++) {

            const currentPublicNft = allNFTsInCollection.publicOwnedNFTs[j];
            const currentAssetId = await sdk.assetIdFromCollectionAndItemId(currentPublicNft.collectionId, currentPublicNft.itemId);
            const currentPublicNftWithAssetId = {...currentPublicNft, assetId:currentAssetId};
            allPublicOwnedNFTs.push(currentPublicNftWithAssetId);

          }
        }

        const ownedPrivateNFTs = await checkPrivateNFTsForOwnership(allNFTsInCollection.privateNFTsInCollection);
      
        // add pricate NFTs if account owns them
        // add individually to avoid 2D array. 
        if (ownedPrivateNFTs.length) {

          for (let j = 0; j < ownedPrivateNFTs.length; j++) {
            allPrivateOwnedNFTs.push(ownedPrivateNFTs[j]);
          }
        }

      }

      // flatten 2D arrays for easier displaying in front end


      console.log("PUBLIC OWNED", allPublicOwnedNFTs);
      console.log("PRIVATE OWNED", allPrivateOwnedNFTs);

      setAllOwnedPublicNFTs(allPublicOwnedNFTs);
      setAllOwnedPrivateNFTs(allPrivateOwnedNFTs);
      setCurrentlyFetching(false);
    } catch (e) {
      setCurrentlyFetching(false);
      console.error(e);
    }
  }

  const value = {
    createCollection,
    mintNFT,
    allOwnedPublicNFTs,
    allOwnedPrivateNFTs,
    currentPage,
    setCurrentPage
  };

  return (
  <NftContext.Provider value={value}>
    {props.children}
  </NftContext.Provider>
  );
};

NftContext.propTypes = {
  children: PropTypes.any
};

export const useNft = () => ({ ...useContext(NftContext) });