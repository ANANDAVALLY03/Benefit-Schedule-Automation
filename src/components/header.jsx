import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  User,
  Sun,
  Moon,
  ShieldPlus,
} from "lucide-react";

const Header = ({ darkMode, toggleTheme }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
  };

  return (
    <header
      className={`
        canopy-wave-header
        relative
        h-20
        flex
        items-center
        justify-between
        px-6
        border-b
        overflow-hidden
        transition-colors
        duration-300
        ${
          darkMode
            ? `
              bg-gradient-to-r
              from-[#0B241C]
              via-[#12352B]
              to-[#1E5A45]
              border-[#1E5A45]
            `
            : `
              bg-gradient-to-r
              from-[#E8F2EC]
              via-[#DCEFE3]
              to-[#A8D5BA]
              border-[#D5E2DA]
            `
        }
      `}
    >
      {/* =====================================
          HEADER CONTENT
      ===================================== */}

      <div className="relative z-10 flex items-center justify-between w-full">

        {/* =====================================
            CANOPY BRAND
        ===================================== */}

        <div className="flex items-center gap-3">

          {/* Shield Icon */}

          <div
            className={`
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              transition-all
              duration-300
              hover:scale-105
              ${
                darkMode
                  ? "bg-[#E8F2EC] text-[#12352B]"
                  : "bg-white/90 text-[#1E5A45]"
              }
            `}
          >
            <ShieldPlus
              size={22}
              strokeWidth={2.2}
            />
          </div>

          {/* Brand Text */}

          <div>
            <h1
              className={`
                text-xl
                font-bold
                tracking-wide
                ${
                  darkMode
                    ? "text-white"
                    : "text-[#12352B]"
                }
              `}
            >
              CANOPY
            </h1>

            <p
              className={`
                text-xs
                font-semibold
                ${
                  darkMode
                    ? "text-[#DCEFE3]"
                    : "text-[#1E5A45]"
                }
              `}
            >
              Benefit Intelligence
            </p>
          </div>

        </div>

        {/* =====================================
            RIGHT SECTION
        ===================================== */}

        <div className="flex items-center gap-5">

          {/* =================================
              SEARCH
          ================================= */}

          <div className="relative">

            <Search
              size={18}
              className={`
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                transition-colors
                duration-300
                ${
                  darkMode
                    ? "text-[#DCEFE3]"
                    : "text-[#1E5A45]"
                }
              `}
            />

            <input
              type="text"
              placeholder="Search..."
              className={`
                w-64
                h-10
                pl-10
                pr-4
                rounded-lg
                border
                text-sm
                font-medium
                outline-none
                transition-all
                duration-300

                ${
                  darkMode
                    ? `
                      bg-[#12352B]/50
                      border-white/20
                      text-white
                      placeholder:text-[#DCEFE3]
                      focus:border-[#A8D5BA]
                      focus:ring-1
                      focus:ring-[#A8D5BA]
                    `
                    : `
                      bg-white/75
                      border-[#D5E2DA]
                      text-[#12352B]
                      placeholder:text-[#1E5A45]
                      focus:border-[#1E5A45]
                      focus:ring-1
                      focus:ring-[#1E5A45]
                    `
                }
              `}
            />

          </div>

          {/* =================================
              THEME TOGGLE
          ================================= */}

          <button
            type="button"
            onClick={toggleTheme}
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className={`
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              transition-all
              duration-300
              hover:scale-105
              ${
                darkMode
                  ? `
                    bg-[#E8F2EC]
                    text-[#12352B]
                    hover:bg-white
                  `
                  : `
                    bg-[#12352B]
                    text-white
                    hover:bg-[#1E5A45]
                  `
              }
            `}
          >
            {darkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* =================================
              USER PROFILE
          ================================= */}

          <div className="relative">

            <button
              type="button"
              onClick={toggleProfile}
              className={`
                flex
                items-center
                gap-3
                pl-3
                border-l
                transition-all
                duration-300
                ${
                  darkMode
                    ? "border-white/20"
                    : "border-[#D5E2DA]"
                }
              `}
            >

              {/* Avatar */}

              <div
                className={`
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  hover:scale-105
                  ${
                    darkMode
                      ? "bg-[#E8F2EC] text-[#12352B]"
                      : "bg-white text-[#1E5A45]"
                  }
                `}
              >
                <User size={20} />
              </div>

              {/* User Details */}

              <div className="text-left">

                <p
                  className={`
                    text-sm
                    font-semibold
                    ${
                      darkMode
                        ? "text-white"
                        : "text-[#12352B]"
                    }
                  `}
                >
                  John Doe
                </p>

                <p
                  className={`
                    text-xs
                    font-medium
                    ${
                      darkMode
                        ? "text-[#DCEFE3]"
                        : "text-[#1E5A45]"
                    }
                  `}
                >
                  Underwriter
                </p>

              </div>

              {/* Dropdown Arrow */}

              <ChevronDown
                size={17}
                className={`
                  transition-transform
                  duration-200
                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                  ${
                    darkMode
                      ? "text-[#DCEFE3]"
                      : "text-[#12352B]"
                  }
                `}
              />

            </button>

           

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;