import React from "react";
import { Search, Bell, ChevronDown, User } from "lucide-react";

const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-[#DCEFE3] flex items-center justify-between px-6">

      {/* Brand */}
      <div>
        <h1 className="text-xl font-bold text-[#12352B] tracking-wide">
          CANOPY
        </h1>

        <p className="text-xs text-[#7BAE8C]">
          Benefit Intelligence
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7BAE8C]"
          />

          <input
            type="text"
            placeholder="Search..."
            className="
              w-64
              h-10
              pl-10
              pr-4
              rounded-lg
              border
              border-[#DCEFE3]
              bg-[#F7F5EF]
              text-sm
              text-[#24302B]
              placeholder:text-[#7BAE8C]
              outline-none
              focus:border-[#1E5A45]
              focus:ring-1
              focus:ring-[#1E5A45]
            "
          />
        </div>

        {/* Notification */}
        <button
          type="button"
          className="
            relative
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-lg
            text-[#1E5A45]
            hover:bg-[#DCEFE3]
            transition
          "
        >
          <Bell size={20} />

          {/* Notification indicator */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D95C5C]">
          </span>
        </button>

        {/* User */}
        <button
          type="button"
          className="
            flex
            items-center
            gap-3
            pl-3
            border-l
            border-[#DCEFE3]
          "
        >

          {/* User Icon */}
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-[#DCEFE3]
              flex
              items-center
              justify-center
              text-[#1E5A45]
            "
          >
            <User size={20} />
          </div>

          {/* User Details */}
          <div className="text-left">
            <p className="text-sm font-semibold text-[#24302B]">
              John Doe
            </p>

            <p className="text-xs text-[#7BAE8C]">
              Underwriter
            </p>
          </div>

          <ChevronDown
            size={17}
            className="text-[#7BAE8C]"
          />

        </button>

      </div>

    </header>
  );
};

export default Header;