import React from "react";
import Modal from "react-modal";
import useConfirmModal from "./useConfirmModal";
import { MainButton } from "../../button";

const defaultConfirmModalStyle = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(8px)",
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    width: "100vw",
    height: "100vh",
    transform: "translate(-50%, -50%)",
    borderRadius: "16px",
    padding: 0,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.6)",
    border: "0",
    backdropFilter: "blur(12px)",
  },
};

const ConfirmModal = (props) => {
  const { isShow, title, body, hide } = useConfirmModal();
  return (
    <Modal
      appElement={document.getElementById("root")}
      isOpen={isShow}
      style={Object.assign({}, defaultConfirmModalStyle, {})}
    >
      <div className="confirm-modal-container">
        <div className="head">
          <div className="text">{title}</div>
          <img src="https://oss.metopia.xyz/imgs/close.svg" className='Button' alt="X" onClick={hide} />
        </div>
        <div className="confirm-body">{body}</div>
        <div className="button-container">
          <MainButton
            className="button-cancel"
            children="Cancel"
            onClick={props.cancelEvent}
          />
          <MainButton
            className="button-confirm"
            children="Confirm"
            onClick={props.confirmEvent}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
export { useConfirmModal };
