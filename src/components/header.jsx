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
        h-20
        flex
        items-center
        justify-between
        px-6
        border-b
        transition-colors
        duration-300

        ${
          darkMode
            ? "bg-[#12352B] border-[#1E5A45]"
            : "bg-white border-[#D5E2DA]"
        }
      `}
    >

      {/* =========================
          BRAND
      ========================= */}
      <div className="flex items-center gap-3">

        <div
          className={`
            w-9
            h-9
            rounded-lg
            flex
            items-center
            justify-center
            animate-pulse

            ${
              darkMode
                ? "bg-[#E8F2EC] text-[#12352B]"
                : "bg-[#E8F2EC] text-[#1E5A45]"
            }
          `}
        >
          <ShieldPlus
            size={22}
            strokeWidth={2.2}
          />
        </div>

        <div>

          <h1
            className={`
              text-xl
              font-bold
              tracking-wide
              ${darkMode ? "text-white" : "text-[#12352B]"}
            `}
          >
            CANOPY
          </h1>

          <p
            className={`
              text-xs
              font-semibold
              ${darkMode ? "text-[#A8D5BA]" : "text-[#1E5A45]"}
            `}
          >
            Benefit Intelligence
          </p>

        </div>

      </div>


      {/* =========================
          RIGHT SECTION
      ========================= */}
      <div className="flex items-center gap-5">

        {/* Search */}
        <div className="relative">

          <Search
            size={18}
            className={`
              absolute
              left-3
              top-1/2
              -translate-y-1/2

              ${darkMode
                ? "text-[#A8D5BA]"
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
              transition-colors

              ${
                darkMode
                  ? `
                    bg-[#164A38]
                    border-[#2B6A52]
                    text-white
                    placeholder:text-[#A8D5BA]
                    focus:border-[#7BAE8C]
                    focus:ring-1
                    focus:ring-[#7BAE8C]
                  `
                  : `
                    bg-[#F7F5EF]
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


        {/* Theme Toggle */}
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

            ${
              darkMode
                ? `
                  bg-[#E8F2EC]
                  text-[#12352B]
                  hover:bg-white
                `
                : `
                  bg-[#E8F2EC]
                  text-[#1E5A45]
                  hover:bg-[#D5E2DA]
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


        {/* User Section */}
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

              ${
                darkMode
                  ? "border-[#2B6A52]"
                  : "border-[#D5E2DA]"
              }
            `}
          >

            <div
              className={`
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center

                ${
                  darkMode
                    ? "bg-[#E8F2EC] text-[#12352B]"
                    : "bg-[#E8F2EC] text-[#1E5A45]"
                }
              `}
            >
              <User size={20} />
            </div>

            <div className="text-left">

              <p
                className={`
                  text-sm
                  font-semibold
                  ${darkMode ? "text-white" : "text-[#12352B]"}
                `}
              >
                John Doe
              </p>

              <p
                className={`
                  text-xs
                  font-medium
                  ${darkMode ? "text-[#A8D5BA]" : "text-[#1E5A45]"}
                `}
              >
                Underwriter
              </p>

            </div>

            <ChevronDown
              size={17}
              className={`
                transition-transform
                duration-200

                ${profileOpen ? "rotate-180" : ""}

                ${
                  darkMode
                    ? "text-[#A8D5BA]"
                    : "text-[#12352B]"
                }
              `}
            />

          </button>


          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              className={`
                absolute
                right-0
                top-14
                w-48
                rounded-lg
                border
                shadow-lg
                z-50
                overflow-hidden

                ${
                  darkMode
                    ? "bg-[#164A38] border-[#2B6A52]"
                    : "bg-white border-[#D5E2DA]"
                }
              `}
            >

              <button
                type="button"
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition-colors

                  ${
                    darkMode
                      ? `
                        text-white
                        hover:bg-[#1E5A45]
                      `
                      : `
                        text-[#12352B]
                        hover:bg-[#E8F2EC]
                      `
                  }
                `}
              >
                <User size={17} />
                <span>View Profile</span>
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default Header;