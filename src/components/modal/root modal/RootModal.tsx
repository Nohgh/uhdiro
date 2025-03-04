import { ModalPortal } from "../../../helper/Potal";
import SideModal from "../side modal/SideModal";
import "./RootModal.scss";
/**추후 추가될 가능성이 있는 모달 목록
 * 각 건물의 정보 (각 층 정보, 사진 등) 모달
 */
const RootModal = ({ modalName }: { modalName: string }) => {
  return (
    <>
      <ModalPortal>
        <div className="RootModalWrapper">
          {modalName === "side_modal" && <SideModal />}
        </div>
      </ModalPortal>
    </>
  );
};

export default RootModal;
