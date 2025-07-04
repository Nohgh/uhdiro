import { ModalPortal } from "../../../helper/Potal";
import SideModal from "../side modal/SideModal";
import "./Modal.scss";
/**추후 추가될 가능성이 있는 모달 목록
 * 각 건물의 정보 (각 층 정보, 사진 등) 모달
 */
const Modal = ({ name: name }: { name: string }) => {
  return (
    <>
      <ModalPortal>
        <div className="RootModalWrapper">
          {name === "side_modal" && <SideModal />}
        </div>
      </ModalPortal>
    </>
  );
};

export default Modal;
