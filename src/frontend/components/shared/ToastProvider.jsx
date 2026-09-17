"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar
      closeOnClick
      pauseOnHover
      newestOnTop
      theme="light"
      toastStyle={{
        fontSize: "14px",
        borderRadius: "6px",
        padding: "10px 14px",
      }}
    />
  );
}