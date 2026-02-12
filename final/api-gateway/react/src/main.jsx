import { createRoot } from "react-dom/client";
import StarBackground from "./StarBackground";

const bg = document.getElementById("react-bg");

if (bg) {
        createRoot(bg).render(<StarBackground />);
}

