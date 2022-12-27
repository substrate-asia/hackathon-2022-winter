import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../config/redux";
import {
  displayConfirmModal,
  hideConfirmModal,
} from "../../../config/redux/modalControllerSlice";
import "./index.scss";

const useConfirmModal = () => {
  const dispatch = useDispatch();

  const { isShow, title, body } = useSelector(
    (state: RootState) => state.modalController.confirmModal
  );

  const hide = () => {
    dispatch(hideConfirmModal());
  };

  return { isShow, title, body, hide };
};

export default useConfirmModal;
