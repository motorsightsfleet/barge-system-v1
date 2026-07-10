import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createMemoryRouter } from "react-router";
import App from "./App";
import { routeConfig } from "./routes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./index.css";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

function Root() {
  if (USE_MOCK) {
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/dashboard"] });
    return <RouterProvider router={router} />;
  }
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>
);
