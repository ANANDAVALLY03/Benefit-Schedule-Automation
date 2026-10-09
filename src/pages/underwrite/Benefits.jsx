import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserRound,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertTriangle,
  FileText,
  Check,
  RefreshCw,
  X,
} from "lucide-react";

const Benefits = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [validated, setValidated] = useState(false);
  const [fullDocument, setFullDocument] = useState(false);

  /*
   * SOURCE DOCUMENT
   * Expected inside the public folder.
   */
  const documentUrl = "/Medical_Benefit.pdf";

  /*
   * BENEFIT DATA
   */
  const [benefits] = useState([
    {
      id: 1,
      benefit: "Hospital",
      sourceValue: "$12,000",
      extracted: "$12,000",
    },
    {
      id: 2,
      benefit: "Dental",
      sourceValue: "80%",
      extracted: "80%",
    },
    {
      id: 3,
      benefit: "CAT Scan",
      sourceValue: "N/A",
      extracted: "N/A",
    },
    {
      id: 4,
      benefit: "XYZ Benefit",
      sourceValue: "Not Available",
      extracted: "—",
    },
    {
      id: 5,
      benefit: "Maternity",
      sourceValue: "100%",
      extracted: "100%",
    },
  ]);

  /*
   * VALIDATION RESULTS
   */
  const validationResults = useMemo(() => {
    return benefits.map((item) => {
      if (
        item.extracted === "—" ||
        item.sourceValue === "Not Available"
      ) {
        return {
          ...item,
          status: "Unknown",
        };
      }

      if (item.sourceValue === item.extracted) {
        return {
          ...item,
          status: "Valid",
        };
      }

      return {
        ...item,
        status: "Needs Review",
      };
    });
  }, [benefits]);

  /*
   * VALIDATION COUNTS
   */
  const validatedCount = validationResults.filter(
    (item) => item.status === "Valid"
  ).length;

  const reviewCount = validationResults.filter(
    (item) => item.status === "Needs Review"
  ).length;

  const errorCount = validationResults.filter(
    (item) => item.status === "Unknown"
  ).length;

  /*
   * CONFIDENCE PERCENTAGE
   */
  const confidence =
    benefits.length > 0
      ? Math.round((validatedCount / benefits.length) * 100)
      : 0;

  /*
   * NAVIGATE TO VALIDATIONS PAGE
   *
   * Both Compare & Validate and Continue use this handler.
   */
  const handleValidate = () => {
    setValidated(true);

    navigate("/underwriter/validations", {
      state: {
        project: location.state?.project ?? null,
        file: location.state?.file ?? null,
        benefits,
        validationResults,
        summary: {
          validatedCount,
          reviewCount,
          errorCount,
          confidence,
        },
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F5EF] p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        {/* CLIENT DETAILS */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#DCEFE3] text-[#1E5A45] flex items-center justify-center">
            <UserRound size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#12352B]">
              ABC CORPORATION
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[#60756B]">Aetna</span>
              <span className="text-[#A4B3AC]">•</span>
              <span className="text-sm text-[#60756B]">
                03 Jan 2027
              </span>
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF0D8] text-[#B87912] text-xs font-bold">
            <AlertTriangle size={14} />
            Under Review
          </span>

          <span className="text-xs text-[#71837B]">#SCH-1024</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* LEFT - SOURCE DOCUMENT */}
        <div className="xl:col-span-4 bg-white border border-[#D5E2DA] rounded-xl shadow-sm overflow-hidden">
          {/* SOURCE DOCUMENT HEADER */}
          <div className="px-4 py-3 border-b border-[#D5E2DA]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#12352B]">
                  Source Document
                </h2>

                <p className="text-xs text-[#71837B] mt-1">
                  Original uploaded benefit schedule
                </p>
              </div>

              <FileText size={18} className="text-[#1E5A45]" />
            </div>
          </div>

          <div className="p-4">
            {/* FILE INFORMATION */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8F2EC] flex items-center justify-center">
                  <FileText size={16} className="text-[#1E5A45]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#29483D]">
                    Medical_Benefit.pdf
                  </p>

                  <p className="text-[11px] text-[#71837B]">
                    PDF • Page 1 of 12
                  </p>
                </div>
              </div>

              <span className="px-2 py-1 rounded-md bg-[#E8F2EC] text-[#1E5A45] text-[10px] font-bold">
                PDF
              </span>
            </div>

            {/* PDF VIEWER */}
            <div className="relative w-full h-[520px] rounded-lg overflow-hidden border border-[#D5E2DA] bg-[#E9ECEA]">
              <iframe
                src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title="Source Benefit Schedule"
                className="w-full h-full border-0 bg-white"
              />
            </div>

            {/* DOCUMENT CONTROLS */}
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                className="w-9 h-9 rounded-lg border border-[#D5E2DA] flex items-center justify-center text-[#60756B] hover:bg-[#E8F2EC] transition-colors"
                title="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="text-xs font-medium text-[#60756B]">
                Page 1 of 12
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-9 h-9 rounded-lg border border-[#D5E2DA] flex items-center justify-center text-[#60756B] hover:bg-[#E8F2EC] transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setFullDocument(true)}
                  className="w-9 h-9 rounded-lg border border-[#D5E2DA] flex items-center justify-center text-[#60756B] hover:bg-[#E8F2EC] transition-colors"
                  title="View full document"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            {/* FULL DOCUMENT BUTTON */}
            <button
              type="button"
              onClick={() => setFullDocument(true)}
              className="w-full mt-4 h-10 rounded-lg border border-[#1E5A45] text-[#1E5A45] text-sm font-semibold hover:bg-[#E8F2EC] transition-colors"
            >
              View Full Document
            </button>
          </div>
        </div>

        {/* MIDDLE - EXTRACTED DATA */}
        <div className="xl:col-span-5 bg-white border border-[#D5E2DA] rounded-xl shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="px-4 py-3 border-b border-[#D5E2DA]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#12352B]">
                  Extracted Benefit Data
                </h2>

                <p className="text-xs text-[#71837B] mt-1">
                  Compare source values with extracted values
                </p>
              </div>

              <span className="text-xs font-semibold text-[#1E5A45]">
                {benefits.length} Benefits
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="p-4">
            <div className="overflow-x-auto border border-[#E0E8E4] rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F7F4]">
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">
                      Benefit
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">
                      Source
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">
                      Extracted
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {validationResults.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#E5ECE8] hover:bg-[#FAFCFB] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#29483D]">
                        {item.benefit}
                      </td>

                      <td className="px-4 py-3 text-sm text-[#526C61]">
                        {item.sourceValue}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium text-[#1E5A45]">
                        {item.extracted}
                      </td>

                      <td className="px-4 py-3">
                        <BenefitStatus status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT - VALIDATION */}
        <div className="xl:col-span-3 space-y-5">
          {/* VALIDATION CARD */}
          <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D5E2DA]">
              <h2 className="text-sm font-bold text-[#12352B]">
                Validation
              </h2>
            </div>

            <div className="p-4">
              {/* CONFIDENCE */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#526C61]">
                  Confidence
                </span>

                <span className="text-sm font-bold text-[#1E8E68]">
                  {confidence}%
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-2.5 rounded-full bg-[#E6ECE9] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1E8E68] transition-all duration-500"
                  style={{
                    width: `${confidence}%`,
                  }}
                />
              </div>

              {/* VALIDATION COUNTS */}
              <div className="mt-5 space-y-3">
                <ValidationRow
                  color="bg-[#15966F]"
                  label="Validated"
                  count={validatedCount}
                />

                <ValidationRow
                  color="bg-[#F1A329]"
                  label="Needs Review"
                  count={reviewCount}
                />

                <ValidationRow
                  color="bg-[#E94B4B]"
                  label="Errors"
                  count={errorCount}
                />
              </div>

              {/* COMPARE & VALIDATE BUTTON */}
              <button
                type="button"
                onClick={handleValidate}
                className="w-full mt-5 h-10 rounded-lg bg-[#1E5A45] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#164A38] transition-colors"
              >
                {validated ? (
                  <>
                    <Check size={17} />
                    Validation Complete
                  </>
                ) : (
                  <>
                    <RefreshCw size={17} />
                    Compare & Validate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* EXTRACTION STATUS */}
          <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D5E2DA]">
              <h2 className="text-sm font-bold text-[#12352B]">
                Extraction
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <ExtractionRow label="Extracted" />
              <ExtractionRow label="Normalized" />
              <ExtractionRow label="Mapped" />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION
      <div className="mt-5 bg-white border border-[#D5E2DA] rounded-xl px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#12352B]">
            View Validations
          </p>

          <p className="text-xs text-[#6B8076] mt-1">
            Check the extracted data before proceeding.
          </p>
        </div>

        <button
          type="button"
          onClick={handleValidate}
          className="px-5 py-2.5 rounded-lg bg-[#1E5A45] text-white text-sm font-semibold hover:bg-[#164A38] transition-colors"
        >
          Continue
        </button>
      </div> */}

      {/* FULL DOCUMENT MODAL */}
      {fullDocument && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl">
            {/* MODAL HEADER */}
            <div className="h-14 px-5 border-b border-[#D5E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={19} className="text-[#1E5A45]" />

                <div>
                  <p className="text-sm font-bold text-[#12352B]">
                    Medical_Benefit.pdf
                  </p>

                  <p className="text-[11px] text-[#71837B]">
                    Source Benefit Schedule
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFullDocument(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#526C61] hover:bg-[#E8F2EC] transition-colors"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* FULL PDF */}
            <div className="h-[calc(90vh-3.5rem)] bg-[#E9ECEA]">
              <iframe
                src={`${documentUrl}#toolbar=1&navpanes=1`}
                title="Full Source Benefit Schedule"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* BENEFIT STATUS */
const BenefitStatus = ({ status }) => {
  if (status === "Valid") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15966F]">
        <span className="w-2 h-2 rounded-full bg-[#15966F]" />
        Valid
      </span>
    );
  }

  if (status === "Needs Review") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D98A13]">
        <span className="w-2 h-2 rounded-full bg-[#F1A329]" />
        Needs Review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D94B4B]">
      <span className="w-2 h-2 rounded-full bg-[#E94B4B]" />
      Unknown
    </span>
  );
};

/* VALIDATION ROW */
const ValidationRow = ({ color, label, count }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />

        <span className="text-sm text-[#526C61]">{label}</span>
      </div>

      <span className="text-sm font-bold text-[#385348]">{count}</span>
    </div>
  );
};

/* EXTRACTION ROW */
const ExtractionRow = ({ label }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#15966F]" />

        <span className="text-sm text-[#526C61]">{label}</span>
      </div>

      <Check size={17} className="text-[#15966F]" />
    </div>
  );
};

export default Benefits;