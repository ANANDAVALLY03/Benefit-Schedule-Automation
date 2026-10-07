import React, { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

const Layout = ({ children, role = "Underwriter" }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF]">

      {/* Header */}
      <Header
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <div className="flex">

        {/* Sidebar */}
        <Sidebar
          role={role}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-5rem)] bg-[#F7F5EF]">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;