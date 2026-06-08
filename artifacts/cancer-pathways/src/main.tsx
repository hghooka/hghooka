import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MoaAtlasPage from "./pages/moa-atlas";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="min-h-screen bg-[#06030d] p-6">
      <MoaAtlasPage />
    </div>
  </StrictMode>,
);
