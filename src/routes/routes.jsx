import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";

import UnderwriterOverview from "../pages/underWrite/underWrite";
import Documents from "../pages/underwrite/Documents";
import Benefits from "../pages/underwrite/benefits";
import Validations from "../pages/underwrite/Validations";
import Exceptions from "../pages/underwrite/Exceptions";
import Underwriting from "../pages/underwrite/Underwriting";

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

      {/* Exceptions */}
      <Route
        path="/underwriter/exceptions"
        element={
          <Layout role="Underwriter">
            <Exceptions />
          </Layout>
        }
      />

      {/* Underwriting */}
      <Route
        path="/underwriter/work"
        element={
          <Layout role="Underwriter">
            <Underwriting />
          </Layout>
        }
      />

    </Routes>
  );
};

export default AppRoutes;