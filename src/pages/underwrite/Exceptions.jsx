import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileWarning,
  GitPullRequest,
  Map,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

const Exceptions = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedException, setSelectedException] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [resolvedIds, setResolvedIds] = useState([]);

  const [exceptions] = useState([
    {
      id: 1,
      benefit: "Vision Coverage",
      sourceColumn: "Vision Benefits",
      type: "Unmapped",
      status: "Pending",
      priority: "High",
      description:
        "The extracted source column could not be automatically mapped to a Canopy column.",
      phase: "Mapping Review",
      createdBy: "System",
      createdAt: "08 Oct 2026",
    },
    {
      id: 2,
      benefit: "Wellness Coverage",
      sourceColumn: "Wellness Benefits",
      type: "New Benefit",
      status: "CR Pending",
      priority: "High",
      description:
        "This benefit does not exist in the current Canopy master template and requires a Change Request.",
      phase: "Mapping Review",
      createdBy: "John Doe",
      createdAt: "08 Oct 2026",
    },
    {
      id: 3,
      benefit: "Maternity",
      sourceColumn: "Maternity Coverage",
      type: "Validation",
      status: "Blocking",
      priority: "High",
      description:
        "A required option value is missing and must be completed before the schedule can proceed.",
      phase: "Validation",
      createdBy: "System",
      createdAt: "08 Oct 2026",
    },
    {
      id: 4,
      benefit: "Dental",
      sourceColumn: "Dental Coverage",
      type: "Sales Revision",
      status: "Pending",
      priority: "Medium",
      description:
        "Sales has requested a revision to the benefit schedule.",
      phase: "Sales Review",
      createdBy: "Sales",
      createdAt: "08 Oct 2026",
    },
    {
      id: 5,
      benefit: "Pharmacy",
      sourceColumn: "Pharmacy Benefits",
      type: "ProHealth Exception",
      status: "Tech CR",
      priority: "Medium",
      description:
        "A ProHealth mapping or upload exception requires technical review.",
      phase: "ProHealth Upload",
      createdBy: "Tech",
      createdAt: "08 Oct 2026",
    },
  ]);

  const activeExceptions = useMemo(() => {
    return exceptions.filter(
      (item) => !resolvedIds.includes(item.id)
    );
  }, [exceptions, resolvedIds]);

  const filteredExceptions = useMemo(() => {
    return activeExceptions.filter((item) => {
      const matchesFilter =
        activeFilter === "All" || item.type === activeFilter;

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.benefit.toLowerCase().includes(search) ||
        item.sourceColumn.toLowerCase().includes(search) ||
        item.type.toLowerCase().includes(search) ||
        item.status.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [
    activeExceptions,
    activeFilter,
    searchTerm,
  ]);

  const counts = {
    all: activeExceptions.length,

    unmapped: activeExceptions.filter(
      (item) => item.type === "Unmapped"
    ).length,

    changeRequest: activeExceptions.filter(
      (item) => item.type === "New Benefit"
    ).length,

    validation: activeExceptions.filter(
      (item) => item.type === "Validation"
    ).length,

    blocking: activeExceptions.filter(
      (item) => item.status === "Blocking"
    ).length,
  };

  const handleOpenException = (exception) => {
    setSelectedException(exception);
    setResolveOpen(false);
    setSelectedAction("");
  };

  const handleCloseException = () => {
    setSelectedException(null);
    setResolveOpen(false);
    setSelectedAction("");
  };

  const handleResolve = () => {
    if (!selectedException) return;

    if (!selectedAction) {
      return;
    }

    setResolvedIds((prev) => [
      ...prev,
      selectedException.id,
    ]);

    handleCloseException();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F5EF] p-6 lg:p-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#FBE8C5] text-[#B87912] flex items-center justify-center">
              <AlertTriangle size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#12352B]">
                Exceptions
              </h1>

              <p className="text-sm text-[#60756B] mt-1">
                Review and resolve items that require attention before the workflow can proceed.
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-3">

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0D8] text-[#B87912] text-xs font-bold">
            <AlertTriangle size={14} />
            {counts.all} Active Exceptions
          </span>

          <span className="text-xs font-semibold text-[#71837B]">
            #SCH-1024
          </span>

        </div>

      </div>

      {/* PROJECT INFORMATION */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm p-5 mb-5">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <InfoItem
            label="Client"
            value="ABC Corporation"
          />

          <InfoItem
            label="Source Insurer"
            value="Aetna"
          />

          <InfoItem
            label="Benefit Schedule"
            value="Medical_Benefit.pdf"
          />

          <InfoItem
            label="Current Version"
            value="v0.2 Draft"
          />

        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-5">

        <ExceptionSummary
          title="All Exceptions"
          value={counts.all}
          icon={AlertTriangle}
          active={activeFilter === "All"}
          onClick={() => setActiveFilter("All")}
        />

        <ExceptionSummary
          title="Unmapped"
          value={counts.unmapped}
          icon={Map}
          active={activeFilter === "Unmapped"}
          onClick={() => setActiveFilter("Unmapped")}
        />

        <ExceptionSummary
          title="Change Requests"
          value={counts.changeRequest}
          icon={GitPullRequest}
          active={activeFilter === "New Benefit"}
          onClick={() => setActiveFilter("New Benefit")}
        />

        <ExceptionSummary
          title="Validation"
          value={counts.validation}
          icon={XCircle}
          active={activeFilter === "Validation"}
          onClick={() => setActiveFilter("Validation")}
        />

        <ExceptionSummary
          title="Blocking"
          value={counts.blocking}
          icon={FileWarning}
          active={false}
          onClick={() => setActiveFilter("All")}
          blocking
        />

      </div>

      {/* MAIN CONTENT */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm overflow-hidden">

        {/* TABLE HEADER */}
        <div className="px-5 py-4 border-b border-[#D5E2DA]">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h2 className="text-sm font-bold text-[#12352B]">
                Active Exceptions
              </h2>

              <p className="text-xs text-[#71837B] mt-1">
                Resolve blocking and pending items before proceeding.
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71837B]"
              />

              <input
                type="text"
                placeholder="Search exceptions..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                className="
                  w-full sm:w-64
                  h-10
                  pl-9 pr-4
                  rounded-lg
                  border border-[#D5E2DA]
                  bg-[#F7F5EF]
                  text-sm
                  text-[#12352B]
                  outline-none
                  placeholder:text-[#8A9992]
                  focus:border-[#1E5A45]
                  focus:ring-1
                  focus:ring-[#1E5A45]
                "
              />

            </div>

          </div>

        </div>

        {/* FILTERS */}
        <div className="px-5 py-3 border-b border-[#E5ECE8] flex flex-wrap items-center gap-2">

          <FilterButton
            label="All"
            active={activeFilter === "All"}
            onClick={() => setActiveFilter("All")}
          />

          <FilterButton
            label="Unmapped"
            active={activeFilter === "Unmapped"}
            onClick={() => setActiveFilter("Unmapped")}
          />

          <FilterButton
            label="New Benefit"
            active={activeFilter === "New Benefit"}
            onClick={() => setActiveFilter("New Benefit")}
          />

          <FilterButton
            label="Validation"
            active={activeFilter === "Validation"}
            onClick={() => setActiveFilter("Validation")}
          />

          <FilterButton
            label="Sales Revision"
            active={activeFilter === "Sales Revision"}
            onClick={() => setActiveFilter("Sales Revision")}
          />

          <FilterButton
            label="ProHealth Exception"
            active={activeFilter === "ProHealth Exception"}
            onClick={() =>
              setActiveFilter("ProHealth Exception")
            }
          />

        </div>

        {/* TABLE */}
        {filteredExceptions.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="bg-[#F2F7F4]">

                  <TableHeader>
                    Benefit
                  </TableHeader>

                  <TableHeader>
                    Exception Type
                  </TableHeader>

                  <TableHeader>
                    Source Column
                  </TableHeader>

                  <TableHeader>
                    Phase
                  </TableHeader>

                  <TableHeader>
                    Priority
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader>
                    Action
                  </TableHeader>

                </tr>

              </thead>

              <tbody>

                {filteredExceptions.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t border-[#E5ECE8] hover:bg-[#FAFCFB] transition-colors"
                  >

                    <TableCell>
                      <div>
                        <p className="font-semibold text-[#29483D]">
                          {item.benefit}
                        </p>

                        <p className="text-[11px] text-[#87958F] mt-0.5">
                          Created {item.createdAt}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <ExceptionType type={item.type} />
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-[#526C61]">
                        {item.sourceColumn}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-[#60756B]">
                        {item.phase}
                      </span>
                    </TableCell>

                    <TableCell>
                      <PriorityBadge
                        priority={item.priority}
                      />
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={item.status}
                      />
                    </TableCell>

                    <TableCell>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenException(item)
                        }
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-2
                          rounded-lg
                          border
                          border-[#1E5A45]
                          text-[#1E5A45]
                          text-xs
                          font-semibold
                          hover:bg-[#E8F2EC]
                          transition-colors
                        "
                      >
                        Review
                        <ArrowRight size={14} />
                      </button>

                    </TableCell>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <EmptyState />

        )}

      </div>

      {/* FOOTER */}
      <div className="mt-5 bg-white border border-[#D5E2DA] rounded-xl shadow-sm px-5 py-4">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-start gap-3">

            <div className="w-9 h-9 rounded-lg bg-[#E8F2EC] text-[#1E8E68] flex items-center justify-center shrink-0">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#12352B]">
                Exception status
              </p>

              <p className="text-xs text-[#71837B] mt-1">
                {counts.all === 0
                  ? "All exceptions have been resolved."
                  : `${counts.all} exception${
                      counts.all === 1 ? "" : "s"
                    } still require attention.`}
              </p>
            </div>

          </div>

          <button
            type="button"
            disabled={counts.all > 0}
            className={`
              h-10 px-5 rounded-lg
              text-sm font-semibold
              flex items-center justify-center gap-2
              transition-colors
              ${
                counts.all === 0
                  ? "bg-[#1E5A45] text-white hover:bg-[#164A38]"
                  : "bg-[#CBD6D0] text-[#71837B] cursor-not-allowed"
              }
            `}
          >
            Continue to Validations
            <ArrowRight size={17} />
          </button>

        </div>

      </div>

      {/* REVIEW MODAL */}
      {selectedException && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-5">

          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}
            <div className="px-5 py-4 border-b border-[#D5E2DA] flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-[#FBE8C5] text-[#B87912] flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-[#12352B]">
                    Review Exception
                  </h2>

                  <p className="text-xs text-[#71837B] mt-0.5">
                    {selectedException.benefit}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleCloseException}
                className="
                  w-9 h-9
                  rounded-lg
                  flex items-center justify-center
                  text-[#60756B]
                  hover:bg-[#E8F2EC]
                  transition-colors
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="p-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

                <InfoItem
                  label="Exception Type"
                  value={selectedException.type}
                />

                <InfoItem
                  label="Status"
                  value={selectedException.status}
                />

                <InfoItem
                  label="Source Column"
                  value={selectedException.sourceColumn}
                />

                <InfoItem
                  label="Phase"
                  value={selectedException.phase}
                />

              </div>

              <div className="bg-[#F7F5EF] border border-[#D5E2DA] rounded-lg p-4 mb-5">

                <p className="text-xs font-semibold text-[#526C61] mb-1">
                  Description
                </p>

                <p className="text-sm text-[#385348] leading-6">
                  {selectedException.description}
                </p>

              </div>

              {/* UNMAPPED ACTIONS */}
              {selectedException.type === "Unmapped" && (
                <div>

                  <p className="text-sm font-bold text-[#12352B] mb-3">
                    Choose an action
                  </p>

                  <div className="space-y-2">

                    <ActionOption
                      value="Map to Existing"
                      selected={selectedAction === "Map to Existing"}
                      onClick={() =>
                        setSelectedAction("Map to Existing")
                      }
                      title="Map to Existing"
                      description="Map this source column to an existing Canopy column."
                    />

                    <ActionOption
                      value="Mark as N/A"
                      selected={selectedAction === "Mark as N/A"}
                      onClick={() =>
                        setSelectedAction("Mark as N/A")
                      }
                      title="Mark as N/A"
                      description="Exclude this benefit from the proposal."
                    />

                    <ActionOption
                      value="Raise Change Request"
                      selected={
                        selectedAction ===
                        "Raise Change Request"
                      }
                      onClick={() =>
                        setSelectedAction(
                          "Raise Change Request"
                        )
                      }
                      title="Raise Change Request"
                      description="Request a new benefit to be added to the Canopy master."
                    />

                  </div>

                </div>
              )}

              {/* NEW BENEFIT */}
              {selectedException.type === "New Benefit" && (
                <div>

                  <div className="flex items-center gap-2 mb-3">
                    <GitPullRequest
                      size={17}
                      className="text-[#1E5A45]"
                    />

                    <p className="text-sm font-bold text-[#12352B]">
                      Change Request
                    </p>
                  </div>

                  <div className="bg-[#FFF8EA] border border-[#F0D6A5] rounded-lg p-4">

                    <p className="text-xs text-[#8A6B32] leading-5">
                      This benefit requires a Change Request.
                      The Platform Admin must review and approve
                      the request before it can be added to the
                      Canopy master template.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAction("Change Request Submitted")
                    }
                    className="
                      mt-4
                      w-full
                      h-10
                      rounded-lg
                      bg-[#1E5A45]
                      text-white
                      text-sm
                      font-semibold
                      hover:bg-[#164A38]
                      transition-colors
                    "
                  >
                    View Change Request
                  </button>

                </div>
              )}

              {/* VALIDATION */}
              {selectedException.type === "Validation" && (
                <div>

                  <div className="flex items-center gap-2 mb-3">

                    <XCircle
                      size={17}
                      className="text-[#C94C4C]"
                    />

                    <p className="text-sm font-bold text-[#12352B]">
                      Validation Issue
                    </p>

                  </div>

                  <div className="bg-[#FFF0F0] border border-[#E8C2C2] rounded-lg p-4">

                    <p className="text-xs text-[#9A4949] leading-5">
                      Required information is missing or
                      incomplete. Resolve the issue and run
                      validation again before proceeding.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAction("Validation Resolved")
                    }
                    className="
                      mt-4
                      w-full
                      h-10
                      rounded-lg
                      border
                      border-[#1E5A45]
                      text-[#1E5A45]
                      text-sm
                      font-semibold
                      hover:bg-[#E8F2EC]
                      transition-colors
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <RefreshCw size={16} />
                    Mark for Re-validation
                  </button>

                </div>
              )}

              {/* SALES REVISION */}
              {selectedException.type === "Sales Revision" && (
                <div>

                  <div className="bg-[#E8F2EC] border border-[#CDE2D5] rounded-lg p-4">

                    <p className="text-sm font-semibold text-[#12352B]">
                      Sales revision requested
                    </p>

                    <p className="text-xs text-[#60756B] mt-1 leading-5">
                      This item needs to return to the Underwriting
                      Workspace for revision before a new proposal
                      PDF can be generated.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAction("Return to Underwriting")
                    }
                    className="
                      mt-4
                      w-full
                      h-10
                      rounded-lg
                      bg-[#1E5A45]
                      text-white
                      text-sm
                      font-semibold
                      hover:bg-[#164A38]
                      transition-colors
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    Return to Underwriting
                    <ArrowRight size={16} />
                  </button>

                </div>
              )}

              {/* PROHEALTH EXCEPTION */}
              {selectedException.type === "ProHealth Exception" && (
                <div>

                  <div className="bg-[#F2F7F4] border border-[#D5E2DA] rounded-lg p-4">

                    <p className="text-sm font-semibold text-[#12352B]">
                      Technical Change Request
                    </p>

                    <p className="text-xs text-[#60756B] mt-1 leading-5">
                      The Tech Team must review the ProHealth
                      mapping or upload exception before the
                      workflow can be completed.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAction("Tech CR Opened")
                    }
                    className="
                      mt-4
                      w-full
                      h-10
                      rounded-lg
                      bg-[#1E5A45]
                      text-white
                      text-sm
                      font-semibold
                      hover:bg-[#164A38]
                      transition-colors
                    "
                  >
                    View Tech Change Request
                  </button>

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            {selectedException.type === "Unmapped" && (
              <div className="px-5 py-4 border-t border-[#D5E2DA] flex items-center justify-end gap-3">

                <button
                  type="button"
                  onClick={handleCloseException}
                  className="
                    h-10 px-4
                    rounded-lg
                    border border-[#D5E2DA]
                    text-[#526C61]
                    text-sm font-semibold
                    hover:bg-[#F2F7F4]
                    transition-colors
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={!selectedAction}
                  className={`
                    h-10 px-5
                    rounded-lg
                    text-sm font-semibold
                    transition-colors
                    ${
                      selectedAction
                        ? "bg-[#1E5A45] text-white hover:bg-[#164A38]"
                        : "bg-[#CBD6D0] text-[#71837B] cursor-not-allowed"
                    }
                  `}
                >
                  Save & Resolve
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

/* ================================================== */
/* INFO ITEM */
/* ================================================== */

const InfoItem = ({ label, value }) => {
  return (
    <div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#71837B]">
        {label}
      </p>

      <p className="text-sm font-semibold text-[#12352B] mt-1">
        {value}
      </p>

    </div>
  );
};

/* ================================================== */
/* SUMMARY CARD */
/* ================================================== */

const ExceptionSummary = ({
  title,
  value,
  icon: Icon,
  active,
  onClick,
  blocking = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-left
        rounded-xl
        border
        p-4
        transition-all
        ${
          blocking
            ? "bg-[#FFF0F0] border-[#E8C2C2]"
            : active
              ? "bg-[#E8F2EC] border-[#9FCBB0]"
              : "bg-white border-[#D5E2DA] hover:border-[#A8CDB8]"
        }
      `}
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold text-[#60756B]">
            {title}
          </p>

          <p
            className={`
              text-2xl
              font-bold
              mt-1
              ${
                blocking
                  ? "text-[#C94C4C]"
                  : "text-[#12352B]"
              }
            `}
          >
            {value}
          </p>

          <p className="text-[11px] text-[#71837B] mt-1">
            Active
          </p>

        </div>

        <div
          className={`
            w-9 h-9
            rounded-lg
            flex items-center justify-center
            ${
              blocking
                ? "bg-[#F8DADA] text-[#C94C4C]"
                : "bg-[#E8F2EC] text-[#1E5A45]"
            }
          `}
        >
          <Icon size={19} />
        </div>

      </div>

    </button>
  );
};

/* ================================================== */
/* FILTER BUTTON */
/* ================================================== */

const FilterButton = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5
        rounded-lg
        text-xs
        font-semibold
        transition-colors
        ${
          active
            ? "bg-[#1E5A45] text-white"
            : "bg-[#F2F7F4] text-[#526C61] hover:bg-[#E8F2EC] hover:text-[#12352B]"
        }
      `}
    >
      {label}
    </button>
  );
};

/* ================================================== */
/* TABLE HEADER */
/* ================================================== */

const TableHeader = ({ children }) => {
  return (
    <th className="px-5 py-3 text-left text-xs font-bold text-[#526C61]">
      {children}
    </th>
  );
};

/* ================================================== */
/* TABLE CELL */
/* ================================================== */

const TableCell = ({ children }) => {
  return (
    <td className="px-5 py-4 text-sm text-[#526C61]">
      {children}
    </td>
  );
};

/* ================================================== */
/* EXCEPTION TYPE */
/* ================================================== */

const ExceptionType = ({ type }) => {
  const config = {
    Unmapped: {
      icon: Map,
      bg: "bg-[#FFF8EA]",
      text: "text-[#B87912]",
    },

    "New Benefit": {
      icon: GitPullRequest,
      bg: "bg-[#E8F2EC]",
      text: "text-[#1E5A45]",
    },

    Validation: {
      icon: XCircle,
      bg: "bg-[#FFF0F0]",
      text: "text-[#C94C4C]",
    },

    "Sales Revision": {
      icon: RefreshCw,
      bg: "bg-[#EEF3F8]",
      text: "text-[#42647D]",
    },

    "ProHealth Exception": {
      icon: FileWarning,
      bg: "bg-[#F2F7F4]",
      text: "text-[#526C61]",
    },
  };

  const current = config[type] || config.Validation;
  const Icon = current.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-2
        px-2.5 py-1.5
        rounded-lg
        ${current.bg}
        ${current.text}
        text-xs
        font-semibold
      `}
    >
      <Icon size={14} />
      {type}
    </span>
  );
};

/* ================================================== */
/* PRIORITY BADGE */
/* ================================================== */

const PriorityBadge = ({ priority }) => {
  if (priority === "High") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C94C4C]">
        <span className="w-2 h-2 rounded-full bg-[#E94B4B]" />
        High
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B87912]">
      <span className="w-2 h-2 rounded-full bg-[#F1A329]" />
      Medium
    </span>
  );
};

/* ================================================== */
/* STATUS BADGE */
/* ================================================== */

const StatusBadge = ({ status }) => {
  if (status === "Blocking") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C94C4C]">
        <XCircle size={14} />
        Blocking
      </span>
    );
  }

  if (status === "CR Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B87912]">
        <GitPullRequest size={14} />
        CR Pending
      </span>
    );
  }

  if (status === "Tech CR") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526C61]">
        <FileWarning size={14} />
        Tech CR
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B87912]">
      <span className="w-2 h-2 rounded-full bg-[#F1A329]" />
      Pending
    </span>
  );
};

/* ================================================== */
/* ACTION OPTION */
/* ================================================== */

const ActionOption = ({
  value,
  selected,
  onClick,
  title,
  description,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        text-left
        p-3.5
        rounded-lg
        border
        transition-colors
        ${
          selected
            ? "border-[#1E5A45] bg-[#E8F2EC]"
            : "border-[#D5E2DA] bg-white hover:bg-[#FAFCFB]"
        }
      `}
    >

      <div className="flex items-start gap-3">

        <div
          className={`
            w-4 h-4
            mt-0.5
            rounded-full
            border
            flex items-center justify-center
            ${
              selected
                ? "border-[#1E5A45]"
                : "border-[#A8B6AF]"
            }
          `}
        >
          {selected && (
            <span className="w-2 h-2 rounded-full bg-[#1E5A45]" />
          )}
        </div>

        <div>

          <p className="text-sm font-semibold text-[#12352B]">
            {title}
          </p>

          <p className="text-xs text-[#71837B] mt-1">
            {description}
          </p>

        </div>

      </div>

    </button>
  );
};

/* ================================================== */
/* EMPTY STATE */
/* ================================================== */

const EmptyState = () => {
  return (
    <div className="px-6 py-16 text-center">

      <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F2EC] text-[#1E8E68] flex items-center justify-center">
        <CheckCircle2 size={24} />
      </div>

      <h3 className="text-sm font-bold text-[#12352B] mt-4">
        No active exceptions
      </h3>

      <p className="text-xs text-[#71837B] mt-1">
        All exceptions have been resolved for this benefit schedule.
      </p>

    </div>
  );
};

export default Exceptions;