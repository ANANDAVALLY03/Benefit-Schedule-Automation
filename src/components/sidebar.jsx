import React from "react";
import { NavLink } from "react-router-dom";
import { ShieldPlus, LogOut } from "lucide-react";

import { menuConfig } from "../config/menuConfig";

const Sidebar = ({
  role = "Underwriter",
  darkMode = false,
}) => {
  const menuItems = menuConfig[role] || [];

  return (
    <aside
      className={`
        w-64
        min-h-[calc(100vh-5rem)]
        flex
        flex-col
        shrink-0
        border-r
        transition-colors
        duration-300

        ${
          darkMode
            ? `
              bg-[#12352B]
              border-[#1E5A45]
              text-white
            `
            : `
              bg-white
              border-[#D5E2DA]
              text-[#12352B]
            `
        }
      `}
    >

      {/* =========================
          CURRENT ROLE
      ========================= */}
      <div className="px-4 pt-5 pb-3">

        <p
          className={`
            px-2
            mb-2
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            ${darkMode ? "text-white" : "text-[#1E5A45]"}
          `}
        >
          Current Role
        </p>

        <div
          className={`
            px-3
            py-2.5
            rounded-lg
            border

            ${
              darkMode
                ? "bg-[#1E5A45] border-[#2B6A52]"
                : "bg-[#E8F2EC] border-[#D5E2DA]"
            }
          `}
        >
          <p
            className={`
              text-sm
              font-semibold
              ${darkMode ? "text-white" : "text-[#12352B]"}
            `}
          >
            {role}
          </p>
        </div>

      </div>


      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">

        <p
          className={`
            px-3
            mb-2
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            ${darkMode ? "text-white" : "text-[#1E5A45]"}
          `}
        >
          Navigation
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.route}
                to={item.route}
                end={item.name === "Overview"}

                className={({ isActive }) => `
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  font-medium
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? darkMode
                        ? `
                          bg-[#1E5A45]
                          text-white
                        `
                        : `
                          bg-[#E8F2EC]
                          text-[#12352B]
                        `
                      : darkMode
                        ? `
                          text-white
                          hover:bg-[#164A38]
                          hover:text-white
                        `
                        : `
                          text-[#385348]
                          hover:bg-[#E8F2EC]
                          hover:text-[#12352B]
                        `
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                />

                <span>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

        </div>

      </nav>


      {/* =========================
          BOTTOM SECTION
      ========================= */}
      <div
        className={`
          px-3
          py-4
          border-t
          transition-colors
          duration-300

          ${
            darkMode
              ? "border-[#1E5A45]"
              : "border-[#D5E2DA]"
          }
        `}
      >

        {/* Logout */}
        <button
          type="button"
          className={`
            w-full
            flex
            items-center
            gap-3
            px-3
            py-2.5
            rounded-lg
            text-sm
            font-medium
            transition-all
            duration-200

            ${
              darkMode
                ? `
                  text-white
                  hover:bg-[#164A38]
                `
                : `
                  text-[#12352B]
                  hover:bg-[#E8F2EC]
                `
            }
          `}
        >
          <LogOut
            size={18}
            strokeWidth={2}
          />

          <span>
            Logout
          </span>
        </button>


        {/* Footer */}
        <p
          className={`
            mt-3
            text-[11px]
            text-center
            ${darkMode ? "text-white" : "text-[#6B8076]"}
          `}
        >
          Benefit Intelligence Platform
        </p>

      </div>

    </aside>
  );
};

export default Sidebar;