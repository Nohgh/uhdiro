import { useEffect, useRef } from "react";
import useModalStateStore from "../store/useModalStateStore";

/**모달 닫힘을 감지하는 훅
 *@ closeModal : modal을 닫는 함수 (useModalStore에 정의)
 *@ modalRef : modal의 영역을 useRef로 감싼 값
 */
const useModalClose = () => {
  const modalRef = useRef<HTMLDivElement>(null);

  const { closeModal } = useModalStateStore();

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node))
        closeModal();
    };
    document.addEventListener("mousedown", handleClickOutSide);
    return () => document.removeEventListener("mousedown", handleClickOutSide);
  }, [closeModal]);

  return { modalRef, closeModal };
};

export default useModalClose;
