import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PatientMonitoring from "./pages/PatientMonitoring";
import TreatmentLogs from "./pages/TreatmentLogs";
import AIRecommendations from "./pages/AIRecommendations";
import HospitalIntegration from "./pages/HospitalIntegration";
import Navbar from "./components/common/NavBar";
import ProtectedRoute from "./components/login/ProtectedRoute";
import CasualtiesPage from "./pages/CasualtiesPage";
import CasualtyPage from "./pages/CasualtyPage";
import { RequireCatalog } from "./context/CatalogContext";

export default function AppRoutes() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/casualties" element={<RequireCatalog><CasualtiesPage /></RequireCatalog>} />
        <Route path="/casualties/:id" element={<RequireCatalog><CasualtyPage /></RequireCatalog>} />
        <Route path="/patient-monitoring" element={<PatientMonitoring />} />
        <Route path="/treatment-logs" element={<TreatmentLogs />} />
        <Route path="/ai-recommendations" element={<AIRecommendations />} />
        <Route path="/hospital-integration" element={<HospitalIntegration />} />
        {/* <Route path="/patient-monitoring" element={<ProtectedRoute><PatientMonitoring /></ProtectedRoute>} /> */}
        {/* <Route path="/treatment-logs" element={<ProtectedRoute><TreatmentLogs /></ProtectedRoute>} /> */}
        {/* <Route path="/ai-recommendations" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} /> */}
        {/* <Route path="/hospital-integration" element={<ProtectedRoute><HospitalIntegration /></ProtectedRoute>} /> */}
      </Routes>
    </div>
  );
}
