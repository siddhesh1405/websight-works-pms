import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import brandLogo from "./assets/websight_works_logo.jpeg";

document.title = "Websight Works";

const faviconLink =
  document.querySelector("link[rel='icon']") ||
  Object.assign(document.createElement("link"), { rel: "icon" });

faviconLink.href = brandLogo;
faviconLink.type = "image/jpeg";

if (!faviconLink.parentNode) {
  document.head.appendChild(faviconLink);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
