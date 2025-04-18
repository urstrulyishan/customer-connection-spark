
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import MessagesPage from "./pages/MessagesPage";
import ChatbotPage from "./pages/ChatbotPage";
import CompanyRegistration from "./pages/CompanyRegistration";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyProfile from "./pages/CompanyProfile";
import PlatformConnectionsPage from "./pages/PlatformConnectionsPage";
import NotFound from "./pages/NotFound";
import { CompanyProvider } from "./contexts/CompanyContext";
import IshanTechDemo from "./pages/IshanTechDemo";
import SentimentAnalysisPage from "./pages/SentimentAnalysisPage";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CompanyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/company-registration" element={<CompanyRegistration />} />
              <Route path="/company-login" element={<CompanyLogin />} />
              <Route path="/ishantech-demo" element={<IshanTechDemo />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Index />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/company-profile" element={<CompanyProfile />} />
              <Route path="/platform-connections" element={<PlatformConnectionsPage />} />
              <Route path="/sentiment-analysis" element={<SentimentAnalysisPage />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
