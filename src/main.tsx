import React from "react";

import ReactDOM from "react-dom/client";

import { App } from "./App";

import "~/styles/main.scss";
import "sweetalert2/src/sweetalert2.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
