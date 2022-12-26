// @ts-nocheck
import { useTxStatus } from "contexts/txStatusContext";
import MantaLoading from 'components/Loading';
import classNames from 'classnames';
import { useNft } from "contexts/nftContext";
import { useState } from "react";

const CreateCollection = () => {

  const { txStatus } = useTxStatus();
  //const disabled = txStatus?.isProcessing();
  const [disabled,setDisabled] = useState(false);
  const { createCollection } = useNft();

  const onClick = async () => {
    if (disabled) {
      return;
    }
    setDisabled(true);
    await createCollection();
    setDisabled(false);
  }

  return (
  <>
      <div>
      {txStatus?.isProcessing() ? (
        <MantaLoading className="py-4" />
      ) : (
        <button
          id="createCollectionButton"
          onClick={onClick}
          className={classNames(
            'py-3 px-5 cursor-pointer text-xl btn-hover unselectable-text',
            'text-center rounded-full btn-primary w-full',
            { disabled: disabled }
          )}
        >
          {"Create Collection"}
        </button>
      )}
    </div>
  </>
  )
}

export default CreateCollection;