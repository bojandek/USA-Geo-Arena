import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import { initAnalytics } from "./lib/analytics";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  // The theme is applied to the html element before the page is painted, so
  // a visitor who chose the dark theme never sees a flash of the light one.
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>,
);

// Analytics is wired to the consent choice: the script is only loaded once the
// visitor accepts analytics cookies.
initAnalytics();

// Register the service worker so the app can be installed and opened
// offline. It is skipped in development, where Vite serves fresh modules and
// a cache would only get in the way.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => {
        // A failed registration is not fatal - the app simply will not be
        // available offline.
      });
  });
}
