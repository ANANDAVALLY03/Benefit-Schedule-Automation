import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";

import UnderwriterOverview from "../pages/underWrite/underWrite";
import Documents from "../pages/underwrite/Documents";
import Benefits from "../pages/underwrite/benefits";
import Validations from "../pages/underwrite/Validations";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Default */}
      <Route
        path="/"
        element={
          <Navigate
            to="/underwriter"
            replace
          />
        }
      />

      {/* Underwriter Overview */}
      <Route
        path="/underwriter"
        element={
          <Layout role="Underwriter">
            <UnderwriterOverview />
          </Layout>
        }
      />

      {/* Documents */}
      <Route
        path="/underwriter/documents"
        element={
          <Layout role="Underwriter">
            <Documents />
          </Layout>
        }
      />

      {/* Benefits */}
      <Route
        path="/underwriter/benefits"
        element={
          <Layout role="Underwriter">
            <Benefits />
          </Layout>
        }
      />

      {/* Validations */}
      <Route
        path="/underwriter/validations"
        element={
          <Layout role="Underwriter">
            <Validations />
          </Layout>
        }
      />

    </Routes>
  );
};

export default AppRoutes;