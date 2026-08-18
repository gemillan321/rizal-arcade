import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RizalArcade from "./app/RizalArcade";
import "./app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RizalArcade />
  </StrictMode>,
);
