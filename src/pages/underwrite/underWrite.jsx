import React from "react";
import {
  FileText,
  AlertTriangle,
  UserCheck,
  Cloud,
  ArrowUp,
  Hourglass,
  CheckCircle2,
  ClipboardCheck,
  Layers3,
  DollarSign,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

const UnderwriterOverview = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#F7F5EF] via-[#F3F8F4] to-[#DCEFE3] p-6 lg:p-8">

      {/* PAGE HEADER */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-[#12352B]">
          Underwriter Overview
        </h1>

        <p className="mt-2 text-lg font-medium text-[#34745F]">
          Welcome to Canopy Benefit Intelligence.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* ACTIVE SCHEDULES */}
        <div className="
          bg-gradient-to-br from-white to-[#F2FBF6]
          border border-[#D5E2DA]
          rounded-xl
          p-5
          shadow-sm
        ">
          <div className="flex items-start justify-between">

            <div className="
              w-14 h-14
              rounded-2xl
              bg-[#DCEFE3]
              text-[#15966F]
              flex items-center justify-center
            ">
              <FileText size={28} strokeWidth={2} />
            </div>

            <div className="flex-1 ml-5">

              <p className="text-sm font-semibold text-[#203D34]">
                Active Schedules
              </p>

              <p className="text-3xl font-bold text-[#12352B] mt-1">
                24
              </p>

              <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-[#15966F]">
                <ArrowUp size={17} />
                <span>+4 this week</span>
              </div>

            </div>
          </div>
        </div>

        {/* NEEDS REVIEW */}
        <div className="
          bg-gradient-to-br from-white to-[#FFF9EC]
          border border-[#D5E2DA]
          rounded-xl
          p-5
          shadow-sm
        ">
          <div className="flex items-start">

            <div className="
              w-14 h-14
              rounded-2xl
              bg-[#FFF1D8]
              text-[#F19A18]
              flex items-center justify-center
            ">
              <AlertTriangle size={28} strokeWidth={2} />
            </div>

            <div className="ml-5">

              <p className="text-sm font-semibold text-[#203D34]">
                Needs Review
              </p>

              <p className="text-3xl font-bold text-[#12352B] mt-1">
                8
              </p>

              <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-red-500">
                <ArrowUp size={17} />
                <span>+3 high priority</span>
              </div>

            </div>
          </div>
        </div>

        {/* SALES APPROVAL */}
        <div className="
          bg-gradient-to-br from-white to-[#F5F0FF]
          border border-[#D5E2DA]
          rounded-xl
          p-5
          shadow-sm
        ">
          <div className="flex items-start">

            <div className="
              w-14 h-14
              rounded-2xl
              bg-[#EEE8FF]
              text-[#7048E8]
              flex items-center justify-center
            ">
              <UserCheck size={28} strokeWidth={2} />
            </div>

            <div className="ml-5">

              <p className="text-sm font-semibold text-[#203D34]">
                Sales Approval
              </p>

              <p className="text-3xl font-bold text-[#12352B] mt-1">
                5
              </p>

              <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#64748B]">
                <Hourglass size={16} />
                <span>4 awaiting action</span>
              </div>

            </div>
          </div>
        </div>

        {/* PROHEALTH */}
        <div className="
          bg-gradient-to-br from-white to-[#EFF8FF]
          border border-[#D5E2DA]
          rounded-xl
          p-5
          shadow-sm
        ">
          <div className="flex items-start">

            <div className="
              w-14 h-14
              rounded-2xl
              bg-[#DFF1FF]
              text-[#1976D2]
              flex items-center justify-center
            ">
              <Cloud size={28} strokeWidth={2} />
            </div>

            <div className="ml-5">

              <p className="text-sm font-semibold text-[#203D34]">
                ProHealth
              </p>

              <p className="text-3xl font-bold text-[#12352B] mt-1">
                3
              </p>

              <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-[#7048E8]">
                <Hourglass size={16} />
                <span>3 staging pending</span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* PIPELINE + ATTENTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

        {/* SCHEDULE PIPELINE */}
        <div className="
          xl:col-span-2
          bg-gradient-to-br from-white to-[#EFF8F3]
          border border-[#D5E2DA]
          rounded-xl
          p-6
          shadow-sm
        ">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-xl font-bold text-[#12352B]">
              Schedule Pipeline
            </h2>

          </div>

          <div className="relative">

            {/* LINE */}
            <div className="
              absolute
              left-[7%]
              right-[7%]
              top-[67px]
              h-[4px]
              bg-gradient-to-r
              from-[#15966F]
              via-[#1688E5]
              to-[#A46BEF]
              rounded-full
            " />

            <div className="
              relative
              grid grid-cols-6
              gap-3
            ">

              {/* RECEIVED */}
              <PipelineStep
                title="Received"
                count="24"
                color="text-[#15966F]"
                dot="bg-[#168E6B]"
              />

              {/* EXTRACTION */}
              <PipelineStep
                title="Extraction"
                count="18"
                color="text-[#12A879]"
                dot="bg-[#12B88A]"
              />

              {/* REVIEW */}
              <PipelineStep
                title="Review"
                count="8"
                color="text-[#1688E5]"
                dot="bg-[#1688E5]"
              />

              {/* OPTIONS */}
              <PipelineStep
                title="Options"
                count="6"
                color="text-[#6048E8]"
                dot="bg-[#6048E8]"
              />

              {/* APPROVAL */}
              <PipelineStep
                title="Approval"
                count="5"
                color="text-[#874FE8]"
                dot="bg-[#874FE8]"
              />

              {/* PROHEALTH */}
              <PipelineStep
                title="ProHealth"
                count="3"
                color="text-[#A46BEF]"
                dot="bg-[#A46BEF]"
              />

            </div>
          </div>
        </div>

        {/* ATTENTION REQUIRED */}
        <div className="
          bg-gradient-to-br from-white to-[#EFF8F3]
          border border-[#D5E2DA]
          rounded-xl
          p-5
          shadow-sm
        ">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-bold text-[#12352B]">
              Attention Required
            </h2>

            <button
              type="button"
              className="
                flex items-center gap-1
                text-sm font-semibold
                text-[#34745F]
                hover:text-[#12352B]
              "
            >
              View All
              <ArrowRight size={15} />
            </button>

          </div>

          <div className="space-y-2">

            <AttentionItem
              icon={<AlertTriangle size={18} />}
              title="Unknown Benefit Detected"
              company="ABC Corporation • #1024"
              priority="High"
              priorityClass="bg-[#FFE0E0] text-red-500"
              iconClass="bg-[#FFE5E5] text-red-500"
            />

            <AttentionItem
              icon={<AlertTriangle size={18} />}
              title="ProHealth Mapping Missing"
              company="XYZ Limited • #1018"
              priority="High"
              priorityClass="bg-[#FFE0E0] text-red-500"
              iconClass="bg-[#FFF0D9] text-[#F19A18]"
            />

            <AttentionItem
              icon={<FileText size={18} />}
              title="Sales Approval Pending"
              company="DEF Corporation • #1016"
              priority="Medium"
              priorityClass="bg-[#FFF0D9] text-[#E68A00]"
              iconClass="bg-[#FFF0D9] text-[#F19A18]"
            />

          </div>
        </div>

      </div>

      {/* QUICK WORKSPACE */}
      <div className="
        bg-white/80
        border border-[#D5E2DA]
        rounded-xl
        p-5
        shadow-sm
      ">

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">

          <QuickAction
            icon={<FileText size={20} />}
            label="Documents"
          />

          <QuickAction
            icon={<CheckCircle2 size={20} />}
            label="Validations"
          />

          <QuickAction
            icon={<AlertTriangle size={20} />}
            label="Exceptions"
          />

          <QuickAction
            icon={<ClipboardCheck size={20} />}
            label="Underwriting"
          />

          <QuickAction
            icon={<Layers3 size={20} />}
            label="Options"
          />

          <QuickAction
            icon={<DollarSign size={20} />}
            label="Pricing"
          />

          <QuickAction
            icon={<FileCheck2 size={20} />}
            label="Sales Approval"
          />

          <QuickAction
            icon={<Cloud size={20} />}
            label="ProHealth"
          />

        </div>
      </div>

    </div>
  );
};


/* ---------------------------------------------------
   PIPELINE STEP
--------------------------------------------------- */

const PipelineStep = ({
  title,
  count,
  color,
  dot,
}) => {
  return (
    <div className="relative text-center">

      <p className="text-sm font-medium text-[#27463B]">
        {title}
      </p>

      <p className={`text-2xl font-bold mt-1 ${color}`}>
        {count}
      </p>

      <div className="flex justify-center mt-3 relative z-10">

        <div
          className={`
            w-7 h-7
            rounded-full
            ${dot}
            border-4
            border-white
            shadow-sm
          `}
        />

      </div>
    </div>
  );
};


/* ---------------------------------------------------
   ATTENTION ITEM
--------------------------------------------------- */

const AttentionItem = ({
  icon,
  title,
  company,
  priority,
  priorityClass,
  iconClass,
}) => {
  return (
    <div className="
      flex items-center gap-3
      p-3
      rounded-lg
      bg-white/80
      border border-[#E2EAE5]
    ">

      <div
        className={`
          w-10 h-10
          rounded-xl
          flex items-center justify-center
          shrink-0
          ${iconClass}
        `}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-sm font-bold text-[#17392F] truncate">
          {title}
        </p>

        <p className="text-xs text-[#60756B] mt-0.5">
          {company}
        </p>

      </div>

      <span
        className={`
          px-3 py-1
          rounded-full
          text-xs font-bold
          ${priorityClass}
        `}
      >
        {priority}
      </span>

    </div>
  );
};


/* ---------------------------------------------------
   QUICK ACTION
--------------------------------------------------- */

const QuickAction = ({ icon, label }) => {
  return (
    <button
      type="button"
      className="
        flex items-center justify-center gap-2
        min-h-[54px]
        px-3
        rounded-lg
        border border-[#D5E2DA]
        bg-gradient-to-br from-white to-[#F1F8F4]
        text-[#1E5A45]
        hover:border-[#7BAE8C]
        hover:bg-[#E8F2EC]
        transition-all duration-200
      "
    >
      {icon}

      <span className="text-xs font-semibold text-[#27463B]">
        {label}
      </span>
    </button>
  );
};

export default UnderwriterOverview;