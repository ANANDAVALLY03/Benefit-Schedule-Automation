import React, { useMemo, useState } from "react";
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
  const [validated, setValidated] = useState(false);
  const [expandedSection, setExpandedSection] = useState("mandatory");

  const [validationData] = useState({
    mandatoryFields: [
      {
        id: 1,
        field: "Client Name",
        value: "ABC Corporation",
        status: "Valid",
      },
      {
        id: 2,
        field: "Source Insurer",
        value: "Aetna",
        status: "Valid",
      },
      {
        id: 3,
        field: "Assigned Underwriter",
        value: "John Doe",
        status: "Valid",
      },
      {
        id: 4,
        field: "Effective Date",
        value: "03 Jan 2027",
        status: "Valid",
      },
      {
        id: 5,
        field: "Benefit Schedule",
        value: "Medical_Benefit.pdf",
        status: "Valid",
      },
    ],

    options: [
      {
        id: 1,
        benefit: "Hospital",
        option1: "$12,000",
        option2: "$15,000",
        option3: "$20,000",
        status: "Valid",
      },
      {
        id: 2,
        benefit: "Dental",
        option1: "80%",
        option2: "90%",
        option3: "100%",
        status: "Valid",
      },
      {
        id: 3,
        benefit: "Maternity",
        option1: "100%",
        option2: "100%",
        option3: "100%",
        status: "Valid",
      },
      {
        id: 4,
        benefit: "Vision",
        option1: "",
        option2: "80%",
        option3: "90%",
        status: "Error",
      },
      {
        id: 5,
        benefit: "CAT Scan",
        option1: "N/A",
        option2: "N/A",
        option3: "N/A",
        status: "Valid",
      },
    ],

    mapping: [
      {
        id: 1,
        benefit: "Hospital",
        mappedColumn: "Hospital Coverage",
        status: "Valid",
      },
      {
        id: 2,
        benefit: "Dental",
        mappedColumn: "Dental Coverage",
        status: "Valid",
      },
      {
        id: 3,
        benefit: "Maternity",
        mappedColumn: "Maternity Coverage",
        status: "Valid",
      },
      {
        id: 4,
        benefit: "Vision",
        mappedColumn: "Vision Coverage",
        status: "Valid",
      },
      {
        id: 5,
        benefit: "CAT Scan",
        mappedColumn: "CAT Scan Coverage",
        status: "Valid",
      },
    ],
  });

  const mandatoryValid = validationData.mandatoryFields.filter(
    (item) => item.status === "Valid"
  ).length;

  const mandatoryTotal = validationData.mandatoryFields.length;

  const optionValid = validationData.options.filter(
    (item) => item.status === "Valid"
  ).length;

  const optionTotal = validationData.options.length;

  const mappingValid = validationData.mapping.filter(
    (item) => item.status === "Valid"
  ).length;

  const mappingTotal = validationData.mapping.length;

  const issueCount =
    mandatoryTotal -
    mandatoryValid +
    (optionTotal - optionValid) +
    (mappingTotal - mappingValid);

  const totalChecks = mandatoryTotal + optionTotal + mappingTotal;

  const passedChecks =
    mandatoryValid + optionValid + mappingValid;

  const validationPercentage =
    totalChecks > 0
      ? Math.round((passedChecks / totalChecks) * 100)
      : 0;

  const validationPassed = issueCount === 0;

  const handleValidate = () => {
    setValidated(true);
  };

  const toggleSection = (section) => {
    setExpandedSection((prev) =>
      prev === section ? "" : section
    );
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F5EF] p-6 lg:p-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#DCEFE3] text-[#1E5A45] flex items-center justify-center">
              <FileCheck2 size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#12352B]">
                Validations
              </h1>

              <p className="text-sm text-[#60756B] mt-1">
                Validate the benefit schedule before proceeding to PDF generation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <span
            className={`
              inline-flex items-center gap-2
              px-4 py-2 rounded-full
              text-xs font-bold
              ${
                validated && validationPassed
                  ? "bg-[#E8F2EC] text-[#1E8E68]"
                  : "bg-[#FFF0D8] text-[#B87912]"
              }
            `}
          >
            {validated && validationPassed ? (
              <>
                <CheckCircle2 size={15} />
                Validation Passed
              </>
            ) : (
              <>
                <AlertTriangle size={15} />
                Validation Required
              </>
            )}
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
            label="Version"
            value="v0.2 Draft"
          />

        </div>
      </div>

      {/* VALIDATION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">

        <SummaryCard
          title="Mandatory Fields"
          value={`${mandatoryValid}/${mandatoryTotal}`}
          label="Passed"
          icon={CheckCircle2}
          status={mandatoryValid === mandatoryTotal ? "success" : "warning"}
        />

        <SummaryCard
          title="Option Columns"
          value={`${optionValid}/${optionTotal}`}
          label="Passed"
          icon={FileCheck2}
          status={optionValid === optionTotal ? "success" : "warning"}
        />

        <SummaryCard
          title="Mapping"
          value={`${mappingValid}/${mappingTotal}`}
          label="Validated"
          icon={CheckCircle2}
          status={mappingValid === mappingTotal ? "success" : "warning"}
        />

        <SummaryCard
          title="Issues"
          value={issueCount}
          label={issueCount === 0 ? "No Issues" : "Need Attention"}
          icon={issueCount === 0 ? CheckCircle2 : AlertTriangle}
          status={issueCount === 0 ? "success" : "error"}
        />

      </div>

      {/* VALIDATION PROGRESS */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm p-5 mb-5">

        <div className="flex items-center justify-between mb-3">

          <div>
            <h2 className="text-sm font-bold text-[#12352B]">
              Validation Progress
            </h2>

            <p className="text-xs text-[#71837B] mt-1">
              {passedChecks} of {totalChecks} validation checks passed.
            </p>
          </div>

          <span className="text-lg font-bold text-[#1E5A45]">
            {validationPercentage}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-[#E6ECE9] overflow-hidden">

          <div
            className={`
              h-full rounded-full transition-all duration-500
              ${
                validationPassed
                  ? "bg-[#1E8E68]"
                  : "bg-[#D98A13]"
              }
            `}
            style={{
              width: `${validationPercentage}%`,
            }}
          />

        </div>

      </div>

      {/* MANDATORY FIELDS */}
      <ValidationSection
        title="Mandatory Fields"
        description="All required project and benefit information must be completed."
        sectionKey="mandatory"
        expandedSection={expandedSection}
        onToggle={toggleSection}
        status={
          mandatoryValid === mandatoryTotal
            ? "success"
            : "warning"
        }
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-[#F2F7F4]">

                <TableHeader>
                  Field
                </TableHeader>

                <TableHeader>
                  Value
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

              </tr>
            </thead>

            <tbody>

              {validationData.mandatoryFields.map((item) => (

                <tr
                  key={item.id}
                  className="border-t border-[#E5ECE8]"
                >

                  <TableCell bold>
                    {item.field}
                  </TableCell>

                  <TableCell>
                    {item.value || "—"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </ValidationSection>

      {/* OPTION VALIDATION */}
      <ValidationSection
        title="Option Columns"
        description="Check that Current Plan and Options 1, 2 and 3 contain the required values."
        sectionKey="options"
        expandedSection={expandedSection}
        onToggle={toggleSection}
        status={
          optionValid === optionTotal
            ? "success"
            : "warning"
        }
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-[#F2F7F4]">

                <TableHeader>
                  Benefit
                </TableHeader>

                <TableHeader>
                  Option 1
                </TableHeader>

                <TableHeader>
                  Option 2
                </TableHeader>

                <TableHeader>
                  Option 3
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

              </tr>

            </thead>

            <tbody>

              {validationData.options.map((item) => (

                <tr
                  key={item.id}
                  className="border-t border-[#E5ECE8]"
                >

                  <TableCell bold>
                    {item.benefit}
                  </TableCell>

                  <TableCell>
                    <OptionValue value={item.option1} />
                  </TableCell>

                  <TableCell>
                    <OptionValue value={item.option2} />
                  </TableCell>

                  <TableCell>
                    <OptionValue value={item.option3} />
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </ValidationSection>

      {/* MAPPING VALIDATION */}
      <ValidationSection
        title="Mapping"
        description="Confirm that all extracted benefits have been mapped to Canopy columns."
        sectionKey="mapping"
        expandedSection={expandedSection}
        onToggle={toggleSection}
        status={
          mappingValid === mappingTotal
            ? "success"
            : "warning"
        }
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-[#F2F7F4]">

                <TableHeader>
                  Benefit
                </TableHeader>

                <TableHeader>
                  Canopy Mapping
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

              </tr>

            </thead>

            <tbody>

              {validationData.mapping.map((item) => (

                <tr
                  key={item.id}
                  className="border-t border-[#E5ECE8]"
                >

                  <TableCell bold>
                    {item.benefit}
                  </TableCell>

                  <TableCell>
                    {item.mappedColumn}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </ValidationSection>

      {/* VALIDATION RESULT */}
      <div
        className={`
          mt-5 rounded-xl border p-5
          ${
            validationPassed
              ? "bg-[#E8F2EC] border-[#B8D9C6]"
              : "bg-[#FFF8EA] border-[#F0D6A5]"
          }
        `}
      >

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-start gap-3">

            <div
              className={`
                w-10 h-10 rounded-lg
                flex items-center justify-center shrink-0
                ${
                  validationPassed
                    ? "bg-[#D0EBDD] text-[#1E8E68]"
                    : "bg-[#FBE8C5] text-[#B87912]"
                }
              `}
            >
              {validationPassed ? (
                <CheckCircle2 size={21} />
              ) : (
                <AlertTriangle size={21} />
              )}
            </div>

            <div>

              <h3
                className={`
                  text-sm font-bold
                  ${
                    validationPassed
                      ? "text-[#12352B]"
                      : "text-[#8A5A0A]"
                  }
                `}
              >
                {validationPassed
                  ? "Validation Passed"
                  : "Validation Requires Attention"}
              </h3>

              <p
                className={`
                  text-xs mt-1
                  ${
                    validationPassed
                      ? "text-[#526C61]"
                      : "text-[#8A6B32]"
                  }
                `}
              >
                {validationPassed
                  ? "All required validation checks have passed. The benefit schedule is ready for the next step."
                  : `${issueCount} validation issue${
                      issueCount === 1 ? "" : "s"
                    } must be resolved before proceeding.`}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={handleValidate}
              className="
                h-10 px-5 rounded-lg
                border border-[#1E5A45]
                text-[#1E5A45]
                bg-white
                text-sm font-semibold
                flex items-center gap-2
                hover:bg-[#E8F2EC]
                transition-colors
              "
            >
              <RefreshCw size={16} />
              Re-validate
            </button>

            <button
              type="button"
              disabled={!validationPassed}
              className={`
                h-10 px-5 rounded-lg
                text-sm font-semibold
                flex items-center gap-2
                transition-colors
                ${
                  validationPassed
                    ? "bg-[#1E5A45] text-white hover:bg-[#164A38]"
                    : "bg-[#CBD6D0] text-[#71837B] cursor-not-allowed"
                }
              `}
            >
              Continue to Underwriting
              <ArrowRight size={17} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

/* -------------------------------------------------- */
/* INFO ITEM */
/* -------------------------------------------------- */

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

/* -------------------------------------------------- */
/* SUMMARY CARD */
/* -------------------------------------------------- */

const SummaryCard = ({
  title,
  value,
  label,
  icon: Icon,
  status,
}) => {
  const styles = {
    success: {
      wrapper: "bg-[#E8F2EC] border-[#CDE2D5]",
      icon: "bg-[#D5EADF] text-[#1E8E68]",
      value: "text-[#12352B]",
    },
    warning: {
      wrapper: "bg-[#FFF8EA] border-[#F0D6A5]",
      icon: "bg-[#FBE8C5] text-[#B87912]",
      value: "text-[#8A5A0A]",
    },
    error: {
      wrapper: "bg-[#FFF0F0] border-[#E8C2C2]",
      icon: "bg-[#F8DADA] text-[#C94C4C]",
      value: "text-[#C94C4C]",
    },
  };

  const style = styles[status];

  return (
    <div
      className={`
        rounded-xl border p-4
        ${style.wrapper}
      `}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold text-[#60756B]">
            {title}
          </p>

          <p
            className={`
              text-2xl font-bold mt-1
              ${style.value}
            `}
          >
            {value}
          </p>

          <p className="text-[11px] font-medium text-[#71837B] mt-1">
            {label}
          </p>

        </div>

        <div
          className={`
            w-9 h-9 rounded-lg
            flex items-center justify-center
            ${style.icon}
          `}
        >
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
};

/* -------------------------------------------------- */
/* VALIDATION SECTION */
/* -------------------------------------------------- */

const ValidationSection = ({
  title,
  description,
  sectionKey,
  expandedSection,
  onToggle,
  status,
  children,
}) => {
  const isOpen = expandedSection === sectionKey;

  return (
    <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm mb-4 overflow-hidden">

      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#FAFCFB] transition-colors"
      >

        <div className="flex items-center gap-3 text-left">

          <div
            className={`
              w-9 h-9 rounded-lg
              flex items-center justify-center
              ${
                status === "success"
                  ? "bg-[#E8F2EC] text-[#1E8E68]"
                  : "bg-[#FFF0D8] text-[#B87912]"
              }
            `}
          >
            {status === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertTriangle size={19} />
            )}
          </div>

          <div>

            <h2 className="text-sm font-bold text-[#12352B]">
              {title}
            </h2>

            <p className="text-xs text-[#71837B] mt-1">
              {description}
            </p>

          </div>

        </div>

        {isOpen ? (
          <ChevronUp
            size={19}
            className="text-[#60756B]"
          />
        ) : (
          <ChevronDown
            size={19}
            className="text-[#60756B]"
          />
        )}

      </button>

      {isOpen && (
        <div className="border-t border-[#D5E2DA]">
          {children}
        </div>
      )}

    </div>
  );
};

/* -------------------------------------------------- */
/* TABLE HEADER */
/* -------------------------------------------------- */

const TableHeader = ({ children }) => {
  return (
    <th className="px-5 py-3 text-left text-xs font-bold text-[#526C61]">
      {children}
    </th>
  );
};

/* -------------------------------------------------- */
/* TABLE CELL */
/* -------------------------------------------------- */

const TableCell = ({ children, bold = false }) => {
  return (
    <td
      className={`
        px-5 py-3.5 text-sm
        ${
          bold
            ? "font-semibold text-[#29483D]"
            : "text-[#526C61]"
        }
      `}
    >
      {children}
    </td>
  );
};

/* -------------------------------------------------- */
/* OPTION VALUE */
/* -------------------------------------------------- */

const OptionValue = ({ value }) => {
  if (!value) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C94C4C]">
        <XCircle size={15} />
        Missing
      </span>
    );
  }

  if (value === "N/A") {
    return (
      <span className="text-sm font-medium text-[#8A9790]">
        N/A
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-[#526C61]">
      {value}
    </span>
  );
};

/* -------------------------------------------------- */
/* STATUS BADGE */
/* -------------------------------------------------- */

const StatusBadge = ({ status }) => {
  if (status === "Valid") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15966F]">
        <span className="w-2 h-2 rounded-full bg-[#15966F]" />
        Valid
      </span>
    );
  }

  if (status === "Warning") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B87912]">
        <span className="w-2 h-2 rounded-full bg-[#F1A329]" />
        Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C94C4C]">
      <span className="w-2 h-2 rounded-full bg-[#E94B4B]" />
      Error
    </span>
  );
};

export default Validations;