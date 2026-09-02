import GameTest from "./pages/GameTest";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Portal from "./pages/Portal";
import KidsWorld from "./pages/KidsWorld";
import DinosaurWorld from "./pages/DinosaurWorld";
import GamePage from "./pages/GamePage";
import Grammar from "./pages/Grammar";
import NotFound from "./pages/NotFound";
import TeacherHQ from "./pages/TeacherHQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/world/:code/:studentName" element={<KidsWorld />} />
<Route path="/game/:world/:code/:studentName/:book" element={<GamePage />} />
<Route path="/game/:code/:studentName/:book" element={<GamePage />} />
{/* <Route path="/grammar/:code/:studentName/:book" element={<Grammar />} /> */}
<Route path="/gametest" element={<Navigate to="/portal" replace />} />
              <Route path="/dino/:code/:studentName" element={<DinosaurWorld />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/mpe-teacher-secret-hq" element={<TeacherHQ />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
