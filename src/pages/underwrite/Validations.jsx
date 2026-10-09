import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Validations = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [validated, setValidated] = useState(true);
  const [expandedSection, setExpandedSection] = useState("mandatory");

  const passedResults = location.state?.validationResults ?? [];

  // Default validation data
  const validationData = useMemo(
    () => ({
      mandatory: {
        title: "Mandatory Fields",
        description: "Check that all required benefit fields are populated.",
        items: [
          {
            name: "Benefit Name",
            status: "passed",
            message: "Benefit name is available.",
          },
          {
            name: "Benefit Type",
            status: "passed",
            message: "Benefit type is available.",
          },
          {
            name: "Coverage Amount",
            status: "passed",
            message: "Coverage amount is available.",
          },
          {
            name: "Effective Date",
            status: "passed",
            message: "Effective date is available.",
          },
        ],
      },
      options: {
        title: "Benefit Options",
        description: "Check benefit options and their configured values.",
        items: [
          {
            name: "Medical Coverage",
            status: "passed",
            message: "Medical coverage option is configured.",
          },
          {
            name: "Dependent Coverage",
            status: "passed",
            message: "Dependent coverage option is configured.",
          },
          {
            name: "Optional Benefits",
            status: "review",
            message: "Review optional benefit configuration.",
          },
        ],
      },
      mapping: {
        title: "Field Mapping",
        description: "Check the mapping between source and target fields.",
        items: [
          {
            name: "Benefit Name Mapping",
            status: "passed",
            message: "Source and target fields are mapped.",
          },
          {
            name: "Coverage Mapping",
            status: "passed",
            message: "Coverage fields are mapped.",
          },
          {
            name: "Date Mapping",
            status: "error",
            message: "Verify the effective date mapping.",
          },
        ],
      },
    }),
    []
  );

  // Use results passed from the Benefits page when available.
  const sections = useMemo(() => {
    if (!Array.isArray(passedResults) || passedResults.length === 0) {
      return validationData;
    }

    const normalized = passedResults.map((item, index) => {
      const rawStatus = String(
        item.status ?? item.result ?? item.validationStatus ?? ""
      ).toLowerCase();

      let status = "passed";

      if (
        rawStatus.includes("error") ||
        rawStatus.includes("fail") ||
        rawStatus.includes("invalid")
      ) {
        status = "error";
      } else if (
        rawStatus.includes("review") ||
        rawStatus.includes("warning") ||
        rawStatus.includes("pending")
      ) {
        status = "review";
      }

      return {
        name:
          item.name ??
          item.field ??
          item.fieldName ??
          item.message ??
          `Validation ${index + 1}`,
        status,
        message:
          item.message ??
          item.description ??
          item.details ??
          "Validation check completed.",
      };
    });

    return {
      mandatory: {
        title: "Mandatory Fields",
        description: "Required field validation results.",
        items: normalized,
      },
      options: {
        title: "Benefit Options",
        description: "Benefit option validation results.",
        items: [],
      },
      mapping: {
        title: "Field Mapping",
        description: "Field mapping validation results.",
        items: [],
      },
    };
  }, [passedResults, validationData]);

  const getSectionStats = (items) => ({
    total: items.length,
    passed: items.filter((item) => item.status === "passed").length,
    review: items.filter((item) => item.status === "review").length,
    errors: items.filter((item) => item.status === "error").length,
  });

  const mandatoryStats = getSectionStats(sections.mandatory.items);
  const optionStats = getSectionStats(sections.options.items);
  const mappingStats = getSectionStats(sections.mapping.items);

  const totalChecks =
    mandatoryStats.total + optionStats.total + mappingStats.total;

  const passedChecks =
    mandatoryStats.passed + optionStats.passed + mappingStats.passed;

  const reviewCount =
    mandatoryStats.review + optionStats.review + mappingStats.review;

  const errorCount =
    mandatoryStats.errors + optionStats.errors + mappingStats.errors;

  const issueCount = reviewCount + errorCount;

  const validationPercentage =
    totalChecks > 0
      ? Math.round((passedChecks / totalChecks) * 100)
      : 0;

  const validationPassed = totalChecks > 0 && issueCount === 0;

  const handleValidate = () => {
    setValidated(true);
  };

  // Return to Benefits to make changes and validate again.
  const handleRevalidate = () => {
    navigate("/underwriter/benefits", {
      state: {
        project: location.state?.project ?? null,
        file: location.state?.file ?? null,
      },
    });
  };

  // Open the Exceptions page.
  const handleViewExceptions = () => {
    navigate("/underwriter/exceptions", {
      state: {
        project: location.state?.project ?? null,
        file: location.state?.file ?? null,
        validationResults: passedResults,
      },
    });
  };

  // Move to the Options page.
  const handleNext = () => {
    navigate("/underwriter/options", {
      state: {
        ...location.state,
        validationResults: passedResults,
        validationSummary: {
          totalChecks,
          passedChecks,
          reviewCount,
          errorCount,
          validationPercentage,
          validationPassed,
        },
      },
    });
  };

  const renderStatusIcon = (status) => {
    if (status === "passed") {
      return <CheckCircle2 size={18} className="text-green-600" />;
    }

    if (status === "review") {
      return <AlertTriangle size={18} className="text-amber-500" />;
    }

    return <XCircle size={18} className="text-red-600" />;
  };

  const renderSection = (key, section) => {
    const stats = getSectionStats(section.items);
    const isExpanded = expandedSection === key;

    return (
      <div
        key={key}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <button
          type="button"
          onClick={() => setExpandedSection(isExpanded ? "" : key)}
          className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-slate-50"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileCheck2
              size={21}
              className="shrink-0 text-[#1E5A45]"
            />

            <div>
              <h3 className="font-semibold text-slate-800">
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {section.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {stats.passed}/{stats.total} passed
            </span>

            {stats.errors > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                {stats.errors} errors
              </span>
            )}

            {stats.review > 0 && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {stats.review} review
              </span>
            )}

            {isExpanded ? (
              <ChevronUp size={18} className="text-slate-500" />
            ) : (
              <ChevronDown size={18} className="text-slate-500" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-slate-200">
            {section.items.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">
                No checks are available in this section.
              </div>
            ) : (
              section.items.map((item, index) => (
                <div
                  key={`${key}-${item.name}-${index}`}
                  className="flex items-start gap-3 border-b border-slate-100 p-4 last:border-b-0"
                >
                  <div className="mt-0.5">
                    {renderStatusIcon(item.status)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.message}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === "passed"
                        ? "bg-green-50 text-green-700"
                        : item.status === "review"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.status === "passed"
                      ? "Passed"
                      : item.status === "review"
                      ? "Review"
                      : "Error"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full space-y-6 bg-[#F4F8FC] p-4 md:p-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Validations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review benefit data checks before proceeding to the next step.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileCheck2 size={18} className="text-[#1E5A45]" />
          Benefit validation
        </div>
      </div>

      {/* Validation summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Checks</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {totalChecks}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Passed</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {passedChecks}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Needs Review</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {reviewCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Errors</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {errorCount}
          </p>
        </div>
      </div>

      {/* Validation progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Validation Progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {passedChecks} of {totalChecks} checks passed
            </p>
          </div>

          <span className="text-xl font-bold text-[#1E5A45]">
            {validationPercentage}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#1E5A45] transition-all"
            style={{ width: `${validationPercentage}%` }}
          />
        </div>
      </div>

      {/* Expandable validation sections */}
      <div className="space-y-4">
        {renderSection("mandatory", sections.mandatory)}
        {renderSection("options", sections.options)}
        {renderSection("mapping", sections.mapping)}
      </div>

      {/* Validation results and actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex items-start gap-3">
          {validationPassed ? (
            <CheckCircle2
              size={24}
              className="mt-0.5 text-green-600"
            />
          ) : (
            <AlertTriangle
              size={24}
              className="mt-0.5 text-amber-500"
            />
          )}

          <div>
            <h2 className="font-semibold text-slate-800">
              {validationPassed
                ? "Validation Passed"
                : "Validation Requires Attention"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {validationPassed
                ? "All available checks have passed."
                : `${issueCount} item(s) require attention.`}
            </p>
          </div>
        </div>

        {!validated && (
          <button
            type="button"
            onClick={handleValidate}
            className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-[#1E5A45] px-5 text-sm font-semibold text-white hover:bg-[#174735]"
          >
            <RefreshCw size={16} />
            Run Validation
          </button>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleRevalidate}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#1E5A45] bg-white px-5 text-sm font-semibold text-[#1E5A45] transition-colors hover:bg-[#E8F2EC]"
          >
            <RefreshCw size={16} />
            Re-validate
          </button>

          <button
            type="button"
            onClick={handleViewExceptions}
            className="flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white px-5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
          >
            <AlertTriangle size={16} />
            View Exceptions
          </button>

          {/* Next button navigates to Options */}
          <button
            type="button"
            onClick={handleNext}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#1E5A45] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#174735]"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Validations;
