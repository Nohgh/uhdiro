import { ReactNode } from "react";
import ReactDOM from "react-dom";

interface ModalPortalProps {
  children: ReactNode;
}
interface ToastPortalProps {
  children: ReactNode;
}
export const ModalPortal = ({ children }: ModalPortalProps) => {
  const el = document.getElementById("modal");
  return el ? ReactDOM.createPortal(children, el) : null;
};
//확장성을 고려하여 Toast도 세팅
export const ToastPortal = ({ children }: ToastPortalProps) => {
  const el = document.getElementById("toast");
  return el ? ReactDOM.createPortal(children, el) : null;
};
