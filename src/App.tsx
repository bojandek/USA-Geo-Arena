import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { GameProvider } from "@/lib/game-store";
import SiteLayout from "@/components/SiteLayout";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";

// The map-heavy modes pull in MapLibre (~790 kB). Loading them on demand
// keeps the first paint of the home page fast.
const DailyPage = lazy(() => import("./pages/DailyPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const BattlePage = lazy(() => import("./pages/BattlePage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* The game modes fill the whole screen, so they sit outside the
                  site layout - no header, no footer, no scrolling. */}
              <Route path="/daily" element={<DailyPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/battle" element={<BattlePage />} />

              {/* Everything else keeps the site header and footer. */}
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                {/* Informational pages */}
                <Route path="/about" element={<InfoPage slug="about" />} />
                <Route path="/team" element={<InfoPage slug="team" />} />
                <Route path="/editorial" element={<InfoPage slug="editorial" />} />
                <Route path="/contact" element={<InfoPage slug="contact" />} />
                <Route path="/privacy" element={<InfoPage slug="privacy" />} />
                <Route path="/terms" element={<InfoPage slug="terms" />} />
                <Route path="/do-not-sell" element={<InfoPage slug="do-not-sell" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </GameProvider>
  </QueryClientProvider>
);

export default App;
