import { Routes, Route } from "react-router-dom";
import Header from "../components/header";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Header />} />
    </Routes>
  );
};

export default AppRoutes;