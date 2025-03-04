import useModalClose from "../../../hooks/useModalClose";
import "./SideModal.scss";
const SideModal = () => {
  const { closeModal, modalRef } = useModalClose();
  return (
    <div className="sideModal" ref={modalRef}>
      <svg
        className="close_icon"
        onClick={closeModal}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
      >
        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
      </svg>
      <div className="sideModal_content">
        <div className="noticeWrapper">
          <div className="title">공지사항</div>
          <div className="contentWrapper">
            <div className="content">
              중요한 기능만 배포한 uhdiro v1 입니다.
            </div>
            <div className="content">많은 관심 부탁드립니다.</div>
            <div className="content">
              사용하면서 불편한 점, 개선하면 좋은 점 등은
            </div>
            <div className="content">밑에 있는 문의하기로 문의바랍니다.</div>
          </div>
        </div>
        <div className="inquireWrapper">
          <div className="inquire_title">문의하기</div>
          <a
            className="inquire_link"
            href={"https://open.kakao.com/o/sM68syjh"}
          >
            오픈채팅으로 문의하기
          </a>
        </div>
        <div className="developerWrapper">
          <div className="developer_title">개발자 정보</div>
          <div className="develper_info">빅데이터학과 20학번 노기훈</div>
          <div className="developer_title">contact</div>
          <div className="develper_info">hoygihoon@gmail.com</div>
        </div>
      </div>
    </div>
  );
};

export default SideModal;
