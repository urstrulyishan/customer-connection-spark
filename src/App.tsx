
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CustomersPage from "./pages/CustomersPage";
import LeadsPage from "./pages/LeadsPage";
import InteractionsPage from "./pages/InteractionsPage";
import MessagesPage from "./pages/MessagesPage";
import ChatbotPage from "./pages/ChatbotPage";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/interactions" element={<InteractionsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
