import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from "./pages/Index";
import CustomersPage from "./pages/CustomersPage";
import LeadsPage from "./pages/LeadsPage";
import CompanyLogin from "./pages/CompanyLogin";
import PlatformConnections from "./pages/PlatformConnections";
import IshanTechAuth from "./pages/IshanTechAuth";
import IshanTechDemo from "./pages/IshanTechDemo";
import { CompanyProvider } from './contexts/CompanyContext';
import SentimentAnalysisPage from "./pages/SentimentAnalysisPage";

function App() {
  return (
    <CompanyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/company-login" element={<CompanyLogin />} />
          <Route path="/platform-connections" element={<PlatformConnections />} />
          <Route path="/ishantech-auth" element={<IshanTechAuth />} />
          <Route path="/ishantech-demo" element={<IshanTechDemo />} />
          <Route path="/sentiment-analysis" element={<SentimentAnalysisPage />} />
        </Routes>
      </Router>
    </CompanyProvider>
  );
}

export default App;
