import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { GameProvider } from "@/lib/game-store";
import { AuthSessionProvider } from "@/lib/auth-session";
import SiteLayout from "@/components/SiteLayout";
import GameLayout from "@/components/GameLayout";
import CookieConsent from "@/components/CookieConsent";
import Onboarding from "@/components/Onboarding";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import Pro from "./pages/Pro";
import SubmitPage from "./pages/SubmitPage";
import InfoPage from "./pages/InfoPage";
import AuthCallback from "./pages/AuthCallback";
import RequireAuth from "@/components/RequireAuth";
import NotFound from "./pages/NotFound";

// The map-heavy modes pull in MapLibre (~790 kB). Loading them on demand
// keeps the first paint of the home page fast.
const DailyPage = lazy(() => import("./pages/DailyPage"));
const WorldPage = lazy(() => import("./pages/WorldPage"));
const BattlePage = lazy(() => import("./pages/BattlePage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const AdminNewsletter = lazy(() => import("./pages/AdminNewsletter"));

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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <AuthSessionProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
              {/* The game modes keep the site header but drop the footer, and
                  they fill the height that is left below the header. */}
              <Route element={<GameLayout />}>
                <Route path="/daily" element={<DailyPage />} />
                <Route path="/world" element={<RequireAuth><WorldPage /></RequireAuth>} />
                <Route path="/battle" element={<RequireAuth><BattlePage /></RequireAuth>} />
                <Route path="/review" element={<RequireAuth><ReviewPage /></RequireAuth>} />
              </Route>

              {/* Everything else keeps the site header and footer. */}
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/archive" element={<RequireAuth><ArchivePage /></RequireAuth>} />
                <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />
                <Route path="/achievements" element={<RequireAuth><Achievements /></RequireAuth>} />
                <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
                <Route path="/pro" element={<Pro />} />
                <Route path="/submit" element={<RequireAuth><SubmitPage /></RequireAuth>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/admin/newsletter" element={<AdminNewsletter />} />
                {/* Informational pages */}
                <Route path="/about" element={<InfoPage slug="about" />} />
                <Route path="/scoring" element={<InfoPage slug="scoring" />} />
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
          <Onboarding />
        </BrowserRouter>
        </AuthSessionProvider>
      </TooltipProvider>
    </GameProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
