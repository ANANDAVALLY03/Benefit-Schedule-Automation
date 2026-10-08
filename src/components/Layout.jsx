import React, { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

const Layout = ({ children, role = "Underwriter" }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F7F5EF]">

      {/* =====================================
          FIXED HEADER
      ===================================== */}

      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      </div>

      {/* =====================================
          FIXED SIDEBAR
      ===================================== */}

      <div className="fixed top-20 left-0 bottom-0 z-40">
        <Sidebar
          role={role}
          darkMode={darkMode}
        />
      </div>

      {/* =====================================
          SCROLLABLE MAIN CONTENT
      ===================================== */}

      <main
        className="
          absolute
          top-20
          left-64
          right-0
          bottom-0
          overflow-y-auto
          bg-[#F7F5EF]
        "
      >
        {children}
      </main>

    </div>
  );
};

export default Layout;