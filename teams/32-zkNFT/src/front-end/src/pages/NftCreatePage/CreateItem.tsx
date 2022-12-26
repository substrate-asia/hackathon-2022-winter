// @ts-nocheck
import React, { useEffect, useState } from "react";
import classNames from 'classnames';
import { useNft } from "contexts/nftContext";
import { useTxStatus } from "contexts/txStatusContext";
import MantaLoading from 'components/Loading';

const CreateItem = () => {

  const [collectionId, setCollectionId] = useState("");
  const [itemId, setItemId] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  //const disabled = txStatus?.isProcessing();
  const [disabled, setDisabled] = useState(false);

  const { txStatus } = useTxStatus();

  const { mintNFT } = useNft();


  // Only allow user to attempt to Mint NFT after all fields have been filled in.
  useEffect(() => {

    if (collectionId && itemId && file) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }

  }, [collectionId, itemId, file]);


  const onClick = async () => {
    if (disabled) {
      return;
    }
    setDisabled(true);
    await mintNFT(collectionId, itemId, address, file);
    setFile(null);
    setFileName("");
    setAddress("");
    setItemId("");
    setCollectionId("");
    setDisabled(false);
  }


  const onChangeCollectionId = (value) => {
    setCollectionId(value);
  }

  const onChangeItemId = (value) => {
    setItemId(value);
  }

  const onChangeAddress = (value) => {
    setAddress(value);
  }

  const retrieveFile = (e) => {
    const data = e.target.files[0];
    let name = e.target.files[0].name;

    if (name.length > 12) {
      name = name.substr(0, 3)
        + "..." + name.substr(name.length - 6);
    }
    setFileName(name);
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      console.log("Buffer data: ", Buffer(reader.result));
      setFile(Buffer(reader.result));
    }

    e.preventDefault();  
  }

  return (
  <>
    <br/>
    <hr></hr>
    <br/>
    <input
      id="collectionIdInput"
      placeholder="Collection ID"
      onChange={(e) => onChangeCollectionId(e.target.value)}
          className={classNames(
            'w-25 pl-3 pt-1 text-2xl font-bold text-black dark:text-white manta-bg-gray outline-none rounded-2xl',
      )}
      onKeyPress={(event) => {
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}
      value={collectionId}
    />

    <br/>
    <br/>
    <input
      id="itemIdInput"
      placeholder="Item ID"
      onChange={(e) => onChangeItemId(e.target.value)}
          className={classNames(
            'w-25 pl-3 pt-1 text-2xl font-bold text-black dark:text-white manta-bg-gray outline-none rounded-2xl',
      )}
      onKeyPress={(event) => {
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}
      value={itemId}
    />
    <br/>
    <br/>
    <input
      id="addressInput"
      placeholder="Address"
      onChange={(e) => onChangeAddress(e.target.value)}
          className={classNames(
            'w-25 pl-3 pt-1 text-2xl font-bold text-black dark:text-white manta-bg-gray outline-none rounded-2xl',
      )}
      value={address}
    />

    <br/> 
    <br/>
    <label className={classNames('py-2 px-3 btn-hover unselectable-text', 'text-center rounded-full btn-primary w-full')}>
      <input className={classNames('hidden')} type="file" onChange={retrieveFile} />
      Upload Image      
    </label>
    <label className={classNames('text-white')}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fileName}</label>

    <br/>
    <br/>
    <div>
      {txStatus?.isProcessing() ? (
        <MantaLoading className="py-4" />
      ) : (
        <button
          id="mintButton"
          onClick={onClick}
          className={classNames(
            'py-3 px-5 cursor-pointer text-xl btn-hover unselectable-text',
            'text-center rounded-full btn-primary w-full',
            { disabled: disabled }
          )}
        >
          {"Mint"}
        </button>
      )}
    </div>
  </>
  )
}

export default CreateItem;