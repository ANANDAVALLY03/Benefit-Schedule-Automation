import React, { useEffect, useMemo, useState } from "react";

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

  Download,

  Search,

  LoaderCircle,

} from "lucide-react";



import {

  getDocument,

  getBenefits,

  getOriginalDocumentUrl,
  validateDocumentBenefits,
} from "../../services/apis";



const normalizeValidationStatus = (status) => {
  const normalized = String(status || "Unverified").trim().toLowerCase();

  if (["valid", "verified", "validated"].includes(normalized)) return "Valid";
  if (["needs review", "review", "pending review"].includes(normalized)) return "Needs Review";
  if (["mismatch", "invalid", "conflict"].includes(normalized)) return "Mismatch";
  if (["n/a", "na", "not applicable", "excluded"].includes(normalized)) return "N/A";
  return "Unverified";
};

const Benefits = () => {

  const navigate = useNavigate();

  const location = useLocation();



  const documentId =

  location.state?.documentId ??

  new URLSearchParams(location.search).get("documentId") ??

  sessionStorage.getItem("lastDocumentId");



  const [documentInfo, setDocumentInfo] = useState(null);

  const [benefits, setBenefits] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [validated, setValidated] = useState(false);

  const [fullDocument, setFullDocument] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");



  const documentUrl = documentId

    ? getOriginalDocumentUrl(documentId,true)

    : null;



  // Load document details and benefits from FastAPI.

  useEffect(() => {

    if (!documentId) {

      setError(

        "No document selected. Please upload a document or open one from Documents."

      );

      return;

    }



    let cancelled = false;



    async function loadData() {

      setLoading(true);

      setError("");



      try {

        const [documentData, benefitsData] = await Promise.all([

          getDocument(documentId),

          getBenefits(documentId),

        ]);



        if (cancelled) return;



        setDocumentInfo(documentData);



        const records = (benefitsData.benefits || []).map(

          (item, index) => {

            const details = [

              ["Limit", item.limits],

              ["Percentage", item.percentages],

              ["Visits", item.visits],

              ["Deductible", item.deductibles],

              ["Copay / UCR", item.copay_ucr],

              ["Treatment", item.benefit_treatment],

            ].filter(

              ([, value]) =>

                value != null &&

                value !== "" &&

                value !== "N/A"

            );



            const baseRecord = {
              id: item.id ?? index,
              benefit: item.benefit_name || "N/A",
              category: item.benefit_category || "N/A",
              extracted: details.length > 0
                ? details.map(([label, value]) => `${label}: ${value}`).join(" | ")
                : "N/A",
              confidence: (item.extraction_confidence || "low").toLowerCase(),
              sourceExcerpt: item.source_excerpt || "N/A",
              attributes: item.other_attributes || {},
              status: normalizeValidationStatus(
                item.validation_status || item.status || "Unverified"
              ),
              validationReason: item.validation_reason || "",
            };

            // Apply underwriter decisions made in the Exceptions page.
            try {
              const overrides = JSON.parse(
                localStorage.getItem(`benefit-status-overrides-${documentId}`) || "{}"
              );
              const override = overrides[String(item.id ?? item.benefit_name)];
              if (override?.status) {
                baseRecord.status = normalizeValidationStatus(override.status);
                baseRecord.validationReason = override.action || "Updated by underwriter";
              }
            } catch {
              // Ignore malformed local browser data and use the API status.
            }

            return baseRecord;

          }

        );



        setBenefits(records);

      } catch (err) {

        if (!cancelled) {

          setError(

            err.message || "Failed to load document information."

          );

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    loadData();



    return () => {

      cancelled = true;

    };

  }, [documentId]);



  const validationResults = useMemo(() => {
    return benefits.map((item) => ({
      ...item,
      status: normalizeValidationStatus(item.status || item.validation_status || "Unverified"),
    }));
  }, [benefits]);

  const validatedCount = validationResults.filter(

    (item) => item.status === "Valid"

  ).length;



  const reviewCount = validationResults.filter(
    (item) => item.status === "Needs Review"
  ).length;



  const errorCount = validationResults.filter(
    (item) => item.status === "Mismatch" || item.status === "Unverified" || item.status === "Unknown"
  ).length;



  // This is extraction confidence, not validation accuracy.

  const confidence = useMemo(() => {

    if (benefits.length === 0) return 0;



    const score = { high: 100, medium: 60, low: 25 };



    return Math.round(

      benefits.reduce(

        (total, item) =>

          total + (score[item.confidence] ?? 25),

        0

      ) / benefits.length

    );

  }, [benefits]);



  const filteredResults = useMemo(() => {

    const query = searchTerm.trim().toLowerCase();



    if (!query) return validationResults;



    return validationResults.filter(

      (item) =>

        item.benefit.toLowerCase().includes(query) ||

        item.category.toLowerCase().includes(query) ||

        item.extracted.toLowerCase().includes(query)

    );

  }, [validationResults, searchTerm]);





const filename =

  documentInfo?.original_filename ||

  documentInfo?.filename ||

  "Uploaded document";



const extension = (

  documentInfo?.file_extension ||

  filename.split(".").pop() ||

  ""

)

  .toLowerCase()

  .replace(/^\./, "");



const isPdf = extension === "pdf";





  const handleValidate = async () => {
    if (!documentId) {
      setError("No document selected. Please upload or select a document first.");
      return;
    }

    // Once comparison has completed, the same button continues to Validations.
    if (validated) {
      navigate("/underwriter/validations", {
        state: {
          documentId,
          document: documentInfo,
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
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await validateDocumentBenefits(documentId);
      const results = Array.isArray(result.results) ? result.results : [];

      if (results.length === 0 && benefits.length > 0) {
        throw new Error("The validation API returned no benefit results.");
      }

      // Match by database ID when available; fall back to the same row index.
      const updatedBenefits = results.map((item, index) => {
        const existing = benefits.find(
          (benefit) =>
            item.id != null && String(benefit.id) === String(item.id)
        ) || benefits[index];

        const details = [
          ["Limit", item.limits],
          ["Percentage", item.percentages],
          ["Visits", item.visits],
          ["Deductible", item.deductibles],
          ["Copay / UCR", item.copay_ucr],
          ["Treatment", item.benefit_treatment],
        ].filter(
          ([, value]) => value != null && value !== "" && value !== "N/A"
        );

        return {
          ...existing,
          id: item.id ?? existing?.id ?? index,
          benefit: item.benefit_name || existing?.benefit || "N/A",
          category: item.benefit_category || existing?.category || "N/A",
          extracted: details.length
            ? details
                .map(([label, value]) =>
                  `${label}: ${typeof value === "object" ? JSON.stringify(value) : value}`
                )
                .join(" | ")
            : existing?.extracted || "N/A",
          confidence: String(
            item.extraction_confidence ?? existing?.confidence ?? "low"
          ).toLowerCase(),
          sourceExcerpt: item.source_excerpt || existing?.sourceExcerpt || "N/A",
          attributes: item.other_attributes || existing?.attributes || {},
          status: normalizeValidationStatus(
            item.status || item.validation_status || "Needs Review"
          ),
          validationReason:
            item.validation_reason ||
            "Review the source document and extracted values.",
        };
      });

      setBenefits(updatedBenefits);
      // Share validation results with the Exceptions page in this browser.
      // The backend should persist these values for cross-device/shared use.
      try {
        const storageKey = `benefit-status-overrides-${documentId}`;
        const savedOverrides = JSON.parse(localStorage.getItem(storageKey) || "{}");
        updatedBenefits.forEach((benefit) => {
          const key = String(benefit.id ?? benefit.benefit);
          savedOverrides[key] = {
            ...(savedOverrides[key] || {}),
            status: benefit.status || "Unverified",
            action: savedOverrides[key]?.action || "Validation result",
            validationReason: benefit.validationReason || "",
            benefitName: benefit.benefit || "",
            updatedAt: new Date().toISOString(),
          };
        });
        localStorage.setItem(storageKey, JSON.stringify(savedOverrides));
      } catch (storageError) {
        console.warn("Could not share validation statuses with Exceptions:", storageError);
      }
      setValidated(true);
    } catch (err) {
      setError(err.message || "Failed to compare and validate benefits.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {

    if (documentUrl) {

      window.open(documentUrl, "_blank", "noopener,noreferrer");

    }

  };



  return (

    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F5EF] p-4 lg:p-6">

      {/* Header */}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCEFE3] text-[#1E5A45]">

            <UserRound size={24} />

          </div>



          <div>

            <h1 className="text-xl font-bold text-[#12352B]">

              {documentInfo?.client_name || "Client Details"}

            </h1>



            <div className="mt-1 flex flex-wrap items-center gap-2">

              <span className="text-sm text-[#60756B]">

                {documentInfo?.source_insurer || "Insurer not available"}

              </span>



              <span className="text-[#A4B3AC]">•</span>



              <span className="text-sm text-[#60756B]">

                Document ID: {documentId || "Not selected"}

              </span>

            </div>

          </div>

        </div>



        <div className="flex flex-col items-start gap-1 lg:items-end">

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0D8] px-4 py-2 text-xs font-bold text-[#B87912]">

            <AlertTriangle size={14} />

            {documentInfo?.processing_status || "Not loaded"}

          </span>



          <span className="text-xs text-[#71837B]">

            {documentInfo?.assigned_underwriter || "Underwriter not assigned"}

          </span>

        </div>

      </div>



      {/* Loading and errors */}

      {loading && (

        <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#D5E2DA] bg-white p-4 text-sm text-[#1E5A45]">

          <LoaderCircle size={18} className="animate-spin" />

          Loading document and extracted benefits...

        </div>

      )}



      {error && (

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">

          <AlertTriangle size={19} className="mt-0.5 shrink-0" />

          <div>

            <p className="font-semibold">Unable to load document</p>

            <p className="mt-1">{error}</p>

            {!documentId && (

              <button

                type="button"

                onClick={() => navigate("/underwriter/documents")}

                className="mt-3 rounded-lg bg-[#1E5A45] px-4 py-2 text-white"

              >

                Go to Documents

              </button>

            )}

          </div>

        </div>

      )}



      {/* Main content */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        {/* LEFT: Source document */}

        <section className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm xl:col-span-4">

          <div className="flex items-center justify-between border-b border-[#D5E2DA] px-4 py-3">

            <div>

              <h2 className="text-sm font-bold text-[#12352B]">

                Source Document

              </h2>

              <p className="mt-1 text-xs text-[#71837B]">

                Original uploaded benefit schedule

              </p>

            </div>

            <FileText size={18} className="text-[#1E5A45]" />

          </div>



          <div className="p-4">

            <div className="mb-3 flex items-center justify-between gap-2">

              <div className="flex min-w-0 items-center gap-2">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F2EC]">

                  <FileText size={16} className="text-[#1E5A45]" />

                </div>



                <div className="min-w-0">

                  <p className="break-all text-xs font-semibold text-[#29483D]">

                    {filename}

                  </p>

                  <p className="mt-1 text-[11px] text-[#71837B]">

                    {extension?.toUpperCase() || "FILE"} • Original document

                  </p>

                </div>

              </div>



              <span className="shrink-0 rounded-md bg-[#E8F2EC] px-2 py-1 text-[10px] font-bold text-[#1E5A45]">

                {extension?.toUpperCase() || "FILE"}

              </span>

            </div>



            {/* PDF preview */}

            <div className="relative h-[520px] overflow-hidden rounded-lg border border-[#D5E2DA] bg-[#E9ECEA]">

              {documentUrl && isPdf ? (

                <iframe

                  src={`${documentUrl}#toolbar=0&navpanes=0`}

                  title="Source Benefit Schedule"

                  className="h-full w-full border-0 bg-white"

                />

              ) : (

                <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">

                  <FileText size={44} className="text-[#71837B]" />

                  <p className="text-sm font-semibold text-[#29483D]">

                    {documentUrl

                      ? "Preview is available for PDF files only."

                      : "No document selected."}

                  </p>

                  <p className="text-xs text-[#71837B]">

                    You can download the original file to view it.

                  </p>

                  {documentUrl && (

                    <button

                      type="button"

                      onClick={handleDownload}

                      className="flex items-center gap-2 rounded-lg bg-[#1E5A45] px-4 py-2 text-sm text-white"

                    >

                      <Download size={16} />

                      Open original file

                    </button>

                  )}

                </div>

              )}

            </div>



            <div className="mt-3 flex items-center justify-between">

              <button

                type="button"

                disabled

                title="Page navigation is controlled by the PDF viewer"

                className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-[#D5E2DA] text-[#A4B3AC]"

              >

                <ChevronLeft size={17} />

              </button>



              <span className="text-xs text-[#60756B]">

                Use PDF viewer controls to navigate pages

              </span>



              <div className="flex items-center gap-2">

                <button

                  type="button"

                  disabled

                  title="Page navigation is controlled by the PDF viewer"

                  className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-[#D5E2DA] text-[#A4B3AC]"

                >

                  <ChevronRight size={17} />

                </button>



                <button

                  type="button"

                  onClick={() => setFullDocument(true)}

                  disabled={!documentUrl || !isPdf}

                  title="View full document"

                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D5E2DA] text-[#60756B] transition-colors hover:bg-[#E8F2EC] disabled:opacity-40"

                >

                  <Maximize2 size={16} />

                </button>

              </div>

            </div>



            <button

              type="button"

              onClick={() => setFullDocument(true)}

              disabled={!documentUrl || !isPdf}

              className="mt-4 h-10 w-full rounded-lg border border-[#1E5A45] text-sm font-semibold text-[#1E5A45] transition-colors hover:bg-[#E8F2EC] disabled:cursor-not-allowed disabled:opacity-40"

            >

              View Full Document

            </button>

          </div>

        </section>



        {/* MIDDLE: Extracted benefit data */}

        <section className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm xl:col-span-5">

          <div className="flex items-center justify-between gap-3 border-b border-[#D5E2DA] px-4 py-3">

            <div>

              <h2 className="text-sm font-bold text-[#12352B]">

                Extracted Benefit Data

              </h2>

              <p className="mt-1 text-xs text-[#71837B]">

                Benefits extracted from the uploaded document

              </p>

            </div>



            <span className="shrink-0 text-xs font-semibold text-[#1E5A45]">

              {benefits.length} Benefits

            </span>

          </div>



          <div className="p-4">

            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#D5E2DA] px-3">

              <Search size={16} className="shrink-0 text-[#71837B]" />

              <input

                type="text"

                value={searchTerm}

                onChange={(event) => setSearchTerm(event.target.value)}

                placeholder="Search extracted benefits..."

                className="h-10 w-full bg-transparent text-sm text-[#29483D] outline-none placeholder:text-[#9AA9A1]"

              />

            </div>



            <div className="overflow-x-auto rounded-lg border border-[#E0E8E4]">

              <table className="w-full min-w-[500px]">

                <thead>

                  <tr className="bg-[#F2F7F4]">

                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">

                      Benefit

                    </th>

                    {/* <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">

                      Source

                    </th> */}

                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">

                      Extracted

                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-[#526C61]">

                      Status

                    </th>

                  </tr>

                </thead>



                <tbody>

                  {!loading && filteredResults.length === 0 ? (

                    <tr>

                      <td

                        colSpan={3}

                        className="px-4 py-8 text-center text-sm text-[#71837B]"

                      >

                        {error

                          ? "Benefits could not be loaded."

                          : benefits.length === 0

                            ? "No benefits found for this document."

                            : "No matching benefits."}

                      </td>

                    </tr>

                  ) : (

                    filteredResults.map((item) => (

                      <tr

                        key={item.id}

                        className="border-t border-[#E5ECE8] transition-colors hover:bg-[#FAFCFB]"

                      >

                        <td className="px-4 py-3 text-sm font-semibold text-[#29483D]">

                          {item.benefit}

                          {item.category !== "N/A" && (

                            <p className="mt-1 text-xs font-normal text-[#71837B]">

                              {item.category}

                            </p>

                          )}

                        </td>




                        <td className="max-w-[260px] whitespace-normal px-4 py-3 text-sm font-medium text-[#1E5A45]">

                          <p>{item.extracted}</p>

                          {item.sourceExcerpt !== "N/A" && (

                            <p className="mt-1 text-xs font-normal text-[#71837B]">

                              Source excerpt: {item.sourceExcerpt}

                            </p>

                          )}

                        </td>



                        <td className="px-4 py-3">

                          <BenefitStatus status={item.status} />

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>



            <p className="mt-3 text-xs text-[#71837B]">

              Source values and validation statuses require comparison with

              an approved reference schedule.

            </p>

          </div>

        </section>



        {/* RIGHT: Validation and extraction */}

        <aside className="space-y-5 xl:col-span-3">

          <section className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm">

            <div className="border-b border-[#D5E2DA] px-4 py-3">

              <h2 className="text-sm font-bold text-[#12352B]">

                Validation

              </h2>

            </div>



            <div className="p-4">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-semibold text-[#526C61]">

                  Extraction Confidence

                </span>

                <span className="text-sm font-bold text-[#1E8E68]">

                  {confidence}%

                </span>

              </div>



              <div className="h-2.5 overflow-hidden rounded-full bg-[#E6ECE9]">

                <div

                  className="h-full rounded-full bg-[#1E8E68] transition-all duration-500"

                  style={{ width: `${confidence}%` }}

                />

              </div>



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

                  label="Mismatch / Unverified"

                  count={errorCount}

                />

              </div>



              <button

                type="button"

                onClick={handleValidate}

                disabled={loading || benefits.length === 0}

                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1E5A45] text-sm font-semibold text-white transition-colors hover:bg-[#164A38] disabled:cursor-not-allowed disabled:opacity-50"

              >

                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Comparing...
                  </>
                ) : validated ? (
                  <>
                    <Check size={17} />
                    Continue to Validations
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Compare &amp; Validate
                  </>
                )}

              </button>

            </div>

          </section>



          <section className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm">

            <div className="border-b border-[#D5E2DA] px-4 py-3">

              <h2 className="text-sm font-bold text-[#12352B]">

                Extraction

              </h2>

            </div>



            <div className="space-y-4 p-4">

              <ExtractionRow

                label="Document Loaded"

                done={Boolean(documentInfo)}

              />

              <ExtractionRow

                label="Benefits Extracted"

                done={benefits.length > 0}

              />

            </div>

          </section>



          <section className="rounded-xl border border-[#D5E2DA] bg-white p-4 shadow-sm">

            <h2 className="text-sm font-bold text-[#12352B]">

              Document Information

            </h2>



            <div className="mt-3 space-y-3 text-sm">

              <InfoRow

                label="Document ID"

                value={documentId || "—"}

              />

              <InfoRow

                label="Status"

                value={documentInfo?.processing_status || "—"}

              />

              <InfoRow

                label="Underwriter"

                value={documentInfo?.assigned_underwriter || "—"}

              />

            </div>

          </section>

        </aside>

      </div>



      {/* Full-document modal */}

      {fullDocument && documentUrl && isPdf && (

        <div

          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6"

          onClick={() => setFullDocument(false)}

        >

          <div

            className="h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl"

            onClick={(event) => event.stopPropagation()}

          >

            <div className="flex h-14 items-center justify-between border-b border-[#D5E2DA] px-5">

              <div className="flex min-w-0 items-center gap-3">

                <FileText size={19} className="shrink-0 text-[#1E5A45]" />

                <div className="min-w-0">

                  <p className="truncate text-sm font-bold text-[#12352B]">

                    {filename}

                  </p>

                  <p className="text-[11px] text-[#71837B]">

                    Original benefit schedule

                  </p>

                </div>

              </div>



              <button

                type="button"

                onClick={() => setFullDocument(false)}

                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#526C61] transition-colors hover:bg-[#E8F2EC]"

                title="Close"

              >

                <X size={19} />

              </button>

            </div>



            <div className="h-[calc(90vh-3.5rem)] bg-[#E9ECEA]">

              <iframe

                src={`${documentUrl}#toolbar=1&navpanes=1`}

                title="Full Source Benefit Schedule"

                className="h-full w-full border-0 bg-white"

              />

            </div>

          </div>

        </div>

      )}

    </div>

  );

};



const BenefitStatus = ({ status }) => {
  const styles = {
    Valid: {
      text: "text-[#15966F]",
      dot: "bg-[#15966F]",
      label: "Valid",
    },
    "Needs Review": {
      text: "text-[#D98A13]",
      dot: "bg-[#F1A329]",
      label: "Needs Review",
    },
    Mismatch: {
      text: "text-[#D94B4B]",
      dot: "bg-[#E94B4B]",
      label: "Mismatch",
    },
    Unverified: {
      text: "text-[#D94B4B]",
      dot: "bg-[#E94B4B]",
      label: "Unverified",
    },
    "N/A": {
      text: "text-[#71837B]",
      dot: "bg-[#A4B3AC]",
      label: "N/A",
    },
    Unknown: {
      text: "text-[#71837B]",
      dot: "bg-[#A4B3AC]",
      label: "Unverified",
    },
  };

  const current = styles[status] || styles.Unverified;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${current.text}`} title={status || "Unverified"}>
      <span className={`h-2 w-2 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

const ValidationRow = ({ color, label, count }) => (

  <div className="flex items-center justify-between">

    <div className="flex items-center gap-2">

      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

      <span className="text-sm text-[#526C61]">{label}</span>

    </div>

    <span className="text-sm font-bold text-[#385348]">{count}</span>

  </div>

);



const ExtractionRow = ({

  label,

  done,

  pendingLabel = "Pending",

}) => (

  <div className="flex items-center justify-between gap-2">

    <div className="flex items-center gap-2.5">

      <span

        className={`h-2.5 w-2.5 rounded-full ${

          done ? "bg-[#15966F]" : "bg-[#A4B3AC]"

        }`}

      />

      <span className="text-sm text-[#526C61]">{label}</span>

    </div>



    {done ? (

      <Check size={17} className="text-[#15966F]" />

    ) : (

      <span className="text-xs text-[#71837B]">{pendingLabel}</span>

    )}

  </div>

);



const InfoRow = ({ label, value }) => (

  <div className="flex items-start justify-between gap-3">

    <span className="text-[#71837B]">{label}</span>

    <span className="break-all text-right font-medium text-[#29483D]">

      {value}

    </span>

  </div>

);



export default Benefits;
