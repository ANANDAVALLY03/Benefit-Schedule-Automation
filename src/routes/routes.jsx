import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";

import UnderwriterOverview from "../pages/underWrite/underWrite";
import Documents from "../pages/underwrite/Documents";
import Benefits from "../pages/underwrite/benefits";
import Validations from "../pages/underwrite/Validations";
import Exceptions from "../pages/underwrite/Exceptions";
import Underwriting from "../pages/underwrite/Underwriting";

import ProposalSalesReview from "../pages/underwrite/pdf&salesReview";
import Options from "../pages/underwrite/options";
import Pricing from "../pages/underwrite/pricing";
const AppRoutes = () => {
  return (
    <Routes>

{/* Options */}
<Route
  path="/underwriter/options"
  element={
    <Layout role="Underwriter">
      <Options />
    </Layout>
  }
/>
{/* Pricing */}
<Route
  path="/underwriter/pricing"
  element={
    <Layout role="Underwriter">
      <Pricing />
    </Layout>
  }
/>

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

      {/* Sales Approval */}
      <Route
        path="/underwriter/sales-approval"
        element={
          <Layout role="Underwriter">
            <ProposalSalesReview />
          </Layout>
        }
      />

    </Routes>
  );
};

export default AppRoutes;