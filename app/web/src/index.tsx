import RDClient from "react-dom/client";
import { App, initEnv } from "web-init";
import "./index.css";

initEnv();

const rootNode = document.getElementById("root");
if (rootNode) {
  const root = RDClient.createRoot(rootNode);
  root.render(<App />);
}
