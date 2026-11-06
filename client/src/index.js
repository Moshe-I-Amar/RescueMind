import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AouthContext";
import { CatalogProvider } from "./context/CatalogContext";
import { ToastProvider } from "./context/ToastContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <CatalogProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </CatalogProvider>
  </AuthProvider>
);
