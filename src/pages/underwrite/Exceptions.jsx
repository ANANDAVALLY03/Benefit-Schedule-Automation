
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getProjects,
  getDocuments,
  getBenefits,
  resolveBenefit,
} from "../../services/apis";

// ==========================================
// HELPERS
// ==========================================

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const unwrap = (response) =>
  response?.data ?? response;

const asArray = (response, key) => {
  const payload = unwrap(response);

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.[key])) {
    return payload[key];
  }

  return [];
};

const idOf = (item) =>
  item?.document_id ?? item?.id;

const projectIdOf = (item) =>
  item?.project_id ??
  item?.projectId ??
  item?.project?.id;

const projectName = (project) =>
  project?.project_name ||
  project?.name ||
  project?.client_name ||
  `Project ${project?.id}`;

const documentName = (document) =>
  document?.original_filename ||
  document?.filename ||
  document?.file_name ||
  document?.document_name ||
  `Document ${idOf(document)}`;

const parseAttributes = (value) => {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return typeof value === "object" &&
    !Array.isArray(value)
    ? value
    : {};
};

const resolutionOf = (benefit) =>
  parseAttributes(
    benefit?.other_attributes
  ).underwriter_resolution || {};

const COMPLETED_ACTIONS = [
  "map_existing",
  "mark_na",
  "raise_change_request",
];

const isReviewCompleted = (benefit) => {
  const resolution = resolutionOf(benefit);

  return (
    normalize(resolution.review_status) ===
      "completed" &&
    COMPLETED_ACTIONS.includes(resolution.action)
  );
};

const isCleared = (benefit) => {
  if (isReviewCompleted(benefit)) return true;

  return [
    "valid",
    "validated",
    "verified",
    "passed",
    "approved",
    "n/a",
    "na",
    "not applicable",
  ].includes(
    normalize(
      benefit?.validation_status ??
        benefit?.status
    )
  );
};

const isPendingAdmin = (benefit) => {
  const resolution = resolutionOf(benefit);

  return (
    isReviewCompleted(benefit) &&
    resolution.action === "raise_change_request" &&
    !["approved", "rejected"].includes(
      normalize(resolution.approval_status)
    )
  );
};

const summaryOf = (benefits = []) => {
  const total = benefits.length;
  const completed = benefits.filter(isCleared).length;
  const remaining = total - completed;
  const adminPending = benefits.filter(isPendingAdmin).length;

  return {
    total,
    completed,
    remaining,
    adminPending,
    percentage: total
      ? Math.round((completed / total) * 100)
      : 0,
    canProceed: total > 0 && remaining === 0,
  };
};

const ACTIONS = [
  {
    value: "map_existing",
    label: "Map to Existing",
    description:
      "Map this benefit provisionally to another extracted benefit.",
  },
  {
    value: "mark_na",
    label: "Mark as N/A",
    description:
      "Mark this benefit as not applicable.",
  },
  {
    value: "raise_change_request",
    label: "Raise Change Request",
    description:
      "Request Admin approval for a new field.",
  },
];

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  return error?.message || fallback;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Exceptions() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialParams = new URLSearchParams(
    location.search
  );

  const initialProjectId =
    initialParams.get("projectId") ||
    location.state?.projectId ||
    "";

  const initialDocumentId =
    initialParams.get("documentId") ||
    location.state?.documentId ||
    "";

  // ==========================================
  // STATE
  // ==========================================

  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [
    benefitsByDocument,
    setBenefitsByDocument,
  ] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState(String(initialProjectId));

  const [
    selectedDocumentId,
    setSelectedDocumentId,
  ] = useState(String(initialDocumentId));

  const [
    expandedDocuments,
    setExpandedDocuments,
  ] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [
    selectedException,
    setSelectedException,
  ] = useState(null);

  const [selectedAction, setSelectedAction] = useState("");
  const [mappedToBenefit, setMappedToBenefit] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [notes, setNotes] = useState("");

  const [
    savingResolution,
    setSavingResolution,
  ] = useState(false);

  const [proceeding, setProceeding] = useState(false);

  // ==========================================
  // LOAD ALL PROJECTS AND DOCUMENTS
  // ==========================================

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResponse, documentResponse] =
        await Promise.all([
          getProjects(),
          getDocuments(),
        ]);

      const projectRecords = asArray(
        projectResponse,
        "projects"
      );

      const documentRecords = asArray(
        documentResponse,
        "documents"
      );

      setProjects(projectRecords);
      setDocuments(documentRecords);

      const validDocuments = documentRecords.filter(
        (document) => idOf(document) != null
      );

     
const results = await Promise.allSettled(
  validDocuments.map(async (document) => {
    console.log("Document object:", document);
    console.log("Document ID sent to benefits API:", document.id);
    console.log("Document ID from helper:", idOf(document));

    const documentId = idOf(document);

    const response = await getBenefits(
      Number(documentId)
    );

    console.log(
      "Benefits API response for document:",
      documentId,
      response
    );

    return {
      documentId: String(documentId),
      benefits: asArray(response, "benefits"),
    };
  })
);


      const loadedBenefits = {};
      const failedDocuments = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          loadedBenefits[result.value.documentId] =
            result.value.benefits;
        } else {
          failedDocuments.push(
            idOf(validDocuments[index])
          );
        }
      });

      setBenefitsByDocument(loadedBenefits);

      if (failedDocuments.length > 0) {
        setError(
          `Unable to load benefits for document(s): ${failedDocuments.join(
            ", "
          )}. Refresh to try again.`
        );
      }

      setSelectedProjectId((previous) => {
        const exists = projectRecords.some(
          (project) =>
            String(project.id) === String(previous)
        );

        if (exists) return String(previous);

        const requestedDocument = validDocuments.find(
          (document) =>
            String(idOf(document)) ===
            String(initialDocumentId)
        );

        const requestedProjectId = requestedDocument
          ? projectIdOf(requestedDocument)
          : null;

        if (
          requestedProjectId != null &&
          projectRecords.some(
            (project) =>
              String(project.id) ===
              String(requestedProjectId)
          )
        ) {
          return String(requestedProjectId);
        }

        return projectRecords.length
          ? String(projectRecords[0].id)
          : "";
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load projects and documents."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==========================================
  // PROJECT AND DOCUMENT SELECTION
  // ==========================================

  const selectedProject = useMemo(
    () =>
      projects.find(
        (project) =>
          String(project.id) ===
          String(selectedProjectId)
      ),
    [projects, selectedProjectId]
  );

  const getProjectDocuments = useCallback(
    (projectId) =>
      documents.filter(
        (document) =>
          String(projectIdOf(document)) ===
          String(projectId)
      ),
    [documents]
  );

  const selectedProjectDocuments = useMemo(
    () => getProjectDocuments(selectedProjectId),
    [getProjectDocuments, selectedProjectId]
  );

  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedDocumentId("");
      return;
    }

    setSelectedDocumentId((previous) => {
      const exists = selectedProjectDocuments.some(
        (document) =>
          String(idOf(document)) === String(previous)
      );

      if (exists) return previous;

      return selectedProjectDocuments.length
        ? String(idOf(selectedProjectDocuments[0]))
        : "";
    });
  }, [selectedProjectId, selectedProjectDocuments]);

  const selectProject = (projectId) => {
    const value = String(projectId);

    setSelectedProjectId(value);
    setSelectedDocumentId("");
    setSelectedException(null);
    setSearchTerm("");
    setActiveFilter("All");
    setNotice("");
    setError("");

    navigate(
      `/underwriter/exceptions?projectId=${encodeURIComponent(
        value
      )}`,
      { replace: true }
    );
  };

  const selectDocument = (documentId) => {
    const value = String(documentId);

    setSelectedDocumentId(value);
    setSelectedException(null);
    setSearchTerm("");
    setActiveFilter("All");

    navigate(
      `/underwriter/exceptions?projectId=${encodeURIComponent(
        selectedProjectId
      )}&documentId=${encodeURIComponent(value)}`,
      { replace: true }
    );
  };

  const selectedDocument = useMemo(
    () =>
      selectedProjectDocuments.find(
        (document) =>
          String(idOf(document)) ===
          String(selectedDocumentId)
      ),
    [selectedProjectDocuments, selectedDocumentId]
  );

  // ==========================================
  // PROJECT-LEVEL COMPLETION
  // ==========================================

  const getProjectSummary = useCallback(
    (projectId) => {
      const projectDocs = getProjectDocuments(projectId);

      const allLoaded =
        projectDocs.length > 0 &&
        projectDocs.every((document) =>
          Object.prototype.hasOwnProperty.call(
            benefitsByDocument,
            String(idOf(document))
          )
        );

      const allBenefits = projectDocs.flatMap(
        (document) =>
          benefitsByDocument[String(idOf(document))] || []
      );

      const summary = summaryOf(allBenefits);

      return {
        ...summary,
        documentCount: projectDocs.length,
        allLoaded,
        canProceed:
          allLoaded &&
          summary.total > 0 &&
          summary.remaining === 0,
      };
    },
    [getProjectDocuments, benefitsByDocument]
  );

  const projectSummary = useMemo(
    () => getProjectSummary(selectedProjectId),
    [getProjectSummary, selectedProjectId]
  );

  const documentBenefits = useMemo(
    () =>
      benefitsByDocument[String(selectedDocumentId)] ||
      [],
    [benefitsByDocument, selectedDocumentId]
  );

  const documentLoaded =
    Object.prototype.hasOwnProperty.call(
      benefitsByDocument,
      String(selectedDocumentId)
    );

  const documentSummary = useMemo(
    () => summaryOf(documentBenefits),
    [documentBenefits]
  );

  // ==========================================
  // EXCEPTIONS FOR SELECTED DOCUMENT
  // ==========================================

  const exceptions = useMemo(
    () =>
      documentBenefits
        .filter((benefit) => !isCleared(benefit))
        .map((benefit, index) => ({
          id: benefit.id ?? index,
          benefitId: benefit.id,
          benefit:
            benefit.benefit_name ||
            `Benefit ${index + 1}`,
          type: benefit.is_manually_added
            ? "New Benefit"
            : "Validation",
          status:
            benefit.validation_status ||
            benefit.status ||
            "Needs Review",
          reason:
            benefit.validation_reason ||
            "Underwriter review required.",
          record: benefit,
        })),
    [documentBenefits]
  );

  const filteredExceptions = useMemo(
    () =>
      exceptions.filter((item) => {
        const query = normalize(searchTerm);

        const matchesSearch = [
          item.benefit,
          item.type,
          item.status,
          item.reason,
        ].some((value) =>
          normalize(value).includes(query)
        );

        const matchesFilter =
          activeFilter === "All" ||
          (activeFilter === "Blocking"
            ? [
                "invalid",
                "failed",
                "mismatch",
                "error",
                "blocking",
              ].includes(normalize(item.status))
            : activeFilter === "New Benefit"
              ? item.type === "New Benefit"
              : item.type === "Validation");

        return matchesSearch && matchesFilter;
      }),
    [exceptions, searchTerm, activeFilter]
  );

  // ==========================================
  // RESOLUTION MODAL
  // ==========================================

  const openModal = (exception) => {
    setSelectedException(exception);
    setSelectedAction("");
    setMappedToBenefit("");
    setNewFieldName("");
    setNotes("");
    setError("");
  };

  const closeModal = () => {
    setSelectedException(null);
    setSelectedAction("");
    setMappedToBenefit("");
    setNewFieldName("");
    setNotes("");
  };

  const existingBenefitOptions = useMemo(
    () =>
      documentBenefits.filter(
        (benefit) =>
          benefit.id != null &&
          String(benefit.id) !==
            String(selectedException?.benefitId)
      ),
    [documentBenefits, selectedException]
  );

  const handleResolve = async () => {
    if (!selectedException || !selectedAction) {
      setError("Please select a resolution action.");
      return;
    }

    if (
      selectedAction === "map_existing" &&
      !mappedToBenefit
    ) {
      setError("Please select an existing benefit.");
      return;
    }

    if (
      selectedAction === "raise_change_request" &&
      !newFieldName.trim()
    ) {
      setError("Please enter a new field name.");
      return;
    }

    setSavingResolution(true);
    setError("");

    try {
      await resolveBenefit(
        Number(selectedDocumentId),
        Number(selectedException.benefitId),
        {
          action: selectedAction,
          notes: notes.trim() || null,
          existing_field: null,
          existing_benefit_id:
            selectedAction === "map_existing"
              ? Number(mappedToBenefit)
              : null,
          new_field_name:
            selectedAction === "raise_change_request"
              ? newFieldName.trim()
              : null,
        }
      );

      const response = await getBenefits(
        Number(selectedDocumentId)
      );

      setBenefitsByDocument((previous) => ({
        ...previous,
        [String(selectedDocumentId)]: asArray(
          response,
          "benefits"
        ),
      }));

      const savedAction = selectedAction;

      closeModal();

      setNotice(
        savedAction === "raise_change_request"
          ? "Change request saved. Underwriter review is complete; Admin approval remains pending."
          : "Exception resolved successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save the resolution."
        )
      );
    } finally {
      setSavingResolution(false);
    }
  };

  // ==========================================
  // PROJECT-LEVEL PRICING HANDOFF
  // ==========================================

  const handleProceedToPricing = async () => {
    if (
      !selectedProject ||
      !projectSummary.canProceed ||
      proceeding
    ) {
      return;
    }

    const projectId = Number(selectedProjectId);

    setProceeding(true);
    setError("");
    setNotice("");

    try {
      /*
        REQUIRED FASTAPI INTEGRATION

        Before navigating, call a backend endpoint
        that verifies all documents in this project
        have completed their Underwriter reviews,
        then saves the project-level Pricing handoff.

        Suggested API:
        POST /api/projects/{projectId}/proceed-to-pricing

        Add the corresponding function to
        services/apis.js and call it here.

        Example after implementation:

        await proceedProjectToPricing(projectId);

        navigate(
          `/underwriter/pricing?projectId=${projectId}`,
          { state: { projectId } }
        );
      */

      throw new Error(
        "Project Pricing handoff API is not connected yet. Connect the FastAPI endpoint before proceeding."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to move the project to Pricing."
        )
      );
    } finally {
      setProceeding(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F7F5EF] p-4 lg:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#12352B]">
            Exceptions
          </h1>
          <p className="mt-1 text-sm text-[#60756B]">
            Select a project, review its documents,
            and proceed to Pricing when all exceptions
            are cleared.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#D5E2DA] bg-white px-4 py-2 text-sm font-medium text-[#1E5A45] disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {notice}
        </div>
      )}

      {error && !selectedException && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ALL PROJECTS */}
      <section className="mb-6 rounded-xl border border-[#D5E2DA] bg-white p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#12352B]">
            All Projects
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Select a project to view its documents
            and review completion.
          </p>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No projects found.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const summary = getProjectSummary(project.id);
              const selected =
                String(selectedProjectId) ===
                String(project.id);

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project.id)}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    selected
                      ? "border-[#1E5A45] bg-[#E8F2EC] shadow-sm"
                      : "border-[#D5E2DA] bg-white hover:border-[#9FCBB0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FolderOpen
                        size={20}
                        className="text-[#1E5A45]"
                      />
                      <div>
                        <h3 className="font-semibold text-[#12352B]">
                          {projectName(project)}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {summary.documentCount} document(s)
                        </p>
                      </div>
                    </div>

                    {selected && (
                      <CheckCircle2
                        size={18}
                        className="text-[#1E5A45]"
                      />
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Review Progress
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        summary.canProceed
                          ? "text-green-600"
                          : "text-[#12352B]"
                      }`}
                    >
                      {summary.allLoaded
                        ? `${summary.percentage}%`
                        : "Unavailable"}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#DCE9E1]">
                    <div
                      className={`h-full rounded-full ${
                        summary.canProceed
                          ? "bg-[#16A34A]"
                          : "bg-[#D4A34B]"
                      }`}
                      style={{
                        width: `${
                          summary.allLoaded
                            ? summary.percentage
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <p
                    className={`mt-3 text-xs font-semibold ${
                      summary.canProceed
                        ? "text-green-600"
                        : "text-amber-700"
                    }`}
                  >
                    {!summary.allLoaded
                      ? "Document data incomplete"
                      : summary.canProceed
                        ? "Ready for Pricing"
                        : `${summary.remaining} review(s) pending`}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* SELECTED PROJECT */}
      {selectedProject && (
        <>
          <section className="mb-6 rounded-xl border border-[#D5E2DA] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#71837B]">
                  Selected Project
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#12352B]">
                  {projectName(selectedProject)}
                </h2>
                <p className="mt-2 text-sm text-[#60756B]">
                  {projectSummary.documentCount} documents ·{" "}
                  {projectSummary.total} benefits
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-[#12352B]">
                  {projectSummary.allLoaded
                    ? `${projectSummary.percentage}%`
                    : "—"}
                </p>
                <p className="text-xs text-gray-500">
                  Project Completion
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Total Benefits", projectSummary.total],
                ["Completed", projectSummary.completed],
                ["Remaining", projectSummary.remaining],
                ["Admin Pending", projectSummary.adminPending],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-[#F2F7F4] p-4"
                >
                  <p className="text-xs text-gray-500">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-bold text-[#12352B]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* DOCUMENTS */}
          <section className="mb-6 overflow-hidden rounded-xl border border-[#D5E2DA] bg-white">
            <div className="border-b border-[#D5E2DA] p-5">
              <h2 className="font-semibold text-[#12352B]">
                Project Documents
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Choose a document to review its exceptions.
              </p>
            </div>

            {selectedProjectDocuments.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                No documents found for this project.
              </p>
            ) : (
              <div className="divide-y divide-[#E5ECE8]">
                {selectedProjectDocuments.map((document) => {
                  const documentId = String(idOf(document));

                  const loaded =
                    Object.prototype.hasOwnProperty.call(
                      benefitsByDocument,
                      documentId
                    );

                  const summary = summaryOf(
                    benefitsByDocument[documentId] || []
                  );

                  const selected =
                    selectedDocumentId === documentId;

                  return (
                    <button
                      key={documentId}
                      type="button"
                      onClick={() => selectDocument(documentId)}
                      className={`flex w-full items-center justify-between gap-4 p-5 text-left ${
                        selected
                          ? "bg-[#E8F2EC]"
                          : "hover:bg-[#F8FBF9]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText
                          size={20}
                          className="text-[#1E5A45]"
                        />
                        <div>
                          <p className="font-semibold text-[#12352B]">
                            {documentName(document)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {loaded
                              ? `${summary.completed} of ${summary.total} reviewed`
                              : "Benefits not loaded"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-semibold ${
                            loaded && summary.canProceed
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {loaded
                            ? `${summary.percentage}%`
                            : "—"}
                        </span>
                        <ChevronRight size={17} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* SELECTED DOCUMENT EXCEPTIONS */}
          {selectedDocument && (
            <section className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D5E2DA] p-5">
                <div>
                  <h2 className="font-semibold text-[#12352B]">
                    Exceptions — {documentName(selectedDocument)}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {documentSummary.remaining} review(s) remaining
                    for this document.
                  </p>
                </div>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search exceptions..."
                    className="rounded-lg border border-[#D5E2DA] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1E5A45]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-[#E5ECE8] p-4">
                {["All", "Validation", "New Benefit", "Blocking"].map(
                  (filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        activeFilter === filter
                          ? "bg-[#1E5A45] text-white"
                          : "bg-[#F2F7F4] text-[#526C61]"
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              {!documentLoaded ? (
                <p className="p-10 text-center text-sm text-gray-500">
                  Unable to load this document's benefits.
                </p>
              ) : filteredExceptions.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2
                    size={30}
                    className="mx-auto text-green-600"
                  />
                  <p className="mt-3 font-semibold text-[#12352B]">
                    {exceptions.length === 0
                      ? "All Exceptions Cleared"
                      : "No Matching Exceptions"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left">
                    <thead className="bg-[#F2F7F4] text-xs text-[#526C61]">
                      <tr>
                        {[
                          "Benefit",
                          "Type",
                          "Status",
                          "Reason",
                          "Action",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredExceptions.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-[#E5ECE8] text-sm"
                        >
                          <td className="px-5 py-4 font-semibold text-[#12352B]">
                            {item.benefit}
                          </td>
                          <td className="px-5 py-4">
                            {item.type}
                          </td>
                          <td className="px-5 py-4 text-amber-700">
                            {item.status}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {item.reason}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => openModal(item)}
                              className="rounded-lg border border-[#1E5A45] px-4 py-2 text-xs font-semibold text-[#1E5A45]"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* PROJECT-LEVEL SAVE & PROCEED */}
          <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#D5E2DA] bg-white p-5">
            <div>
              <p className="font-semibold text-[#12352B]">
                {projectSummary.canProceed
                  ? "Project Review Complete"
                  : "Project Review In Progress"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {projectSummary.canProceed
                  ? "All exceptions across every document are cleared. This project is ready for Pricing."
                  : `${projectSummary.remaining} benefit review(s) remaining across this project.`}
              </p>

              {projectSummary.adminPending > 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  {projectSummary.adminPending} change request(s)
                  pending Admin approval.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleProceedToPricing}
              disabled={
                !projectSummary.canProceed || proceeding
              }
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                projectSummary.canProceed
                  ? "bg-[#16A34A] text-white shadow-sm hover:bg-[#15803D]"
                  : "cursor-not-allowed bg-gray-200 text-gray-500"
              }`}
            >
              {proceeding
                ? "Saving..."
                : "Save & Proceed to options"}
              <ArrowRight size={17} />
            </button>
          </footer>
        </>
      )}

      {/* RESOLUTION MODAL */}
      {selectedException && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Review Exception"
            className="mx-auto my-5 flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#D5E2DA] p-5">
              <div>
                <h2 className="font-bold text-[#12352B]">
                  Review Exception
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedException.benefit}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={savingResolution}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="rounded-lg bg-[#F7F5EF] p-4">
                <p className="text-sm font-semibold text-[#12352B]">
                  {selectedException.benefit}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedException.reason}
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-[#12352B]">
                  Choose an Action
                </h3>

                <div className="space-y-2">
                  {ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => {
                        setSelectedAction(action.value);
                        setError("");
                      }}
                      disabled={savingResolution}
                      className={`w-full rounded-lg border p-4 text-left ${
                        selectedAction === action.value
                          ? "border-[#1E5A45] bg-[#E8F2EC]"
                          : "border-[#D5E2DA]"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#12352B]">
                        {action.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedAction === "map_existing" && (
                <div>
                  <label
                    htmlFor="existing-benefit"
                    className="mb-2 block text-sm font-semibold text-[#12352B]"
                  >
                    Existing Benefit *
                  </label>
                  <select
                    id="existing-benefit"
                    value={mappedToBenefit}
                    onChange={(event) =>
                      setMappedToBenefit(event.target.value)
                    }
                    className="w-full rounded-lg border border-[#D5E2DA] p-3 text-sm"
                  >
                    <option value="">
                      -- Select Benefit --
                    </option>
                    {existingBenefitOptions.map((benefit) => (
                      <option
                        key={benefit.id}
                        value={benefit.id}
                      >
                        {benefit.benefit_name ||
                          `Benefit ${benefit.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedAction === "raise_change_request" && (
                <div>
                  <label
                    htmlFor="new-field-name"
                    className="mb-2 block text-sm font-semibold text-[#12352B]"
                  >
                    New Field Name *
                  </label>
                  <input
                    id="new-field-name"
                    value={newFieldName}
                    onChange={(event) =>
                      setNewFieldName(event.target.value)
                    }
                    placeholder="Enter new field name"
                    className="w-full rounded-lg border border-[#D5E2DA] p-3 text-sm"
                  />
                  <p className="mt-2 text-xs text-amber-700">
                    This change request will require Admin approval.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="resolution-notes"
                  className="mb-2 block text-sm font-semibold text-[#12352B]"
                >
                  Resolution Notes
                </label>
                <textarea
                  id="resolution-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Enter notes..."
                  className="w-full rounded-lg border border-[#D5E2DA] p-3 text-sm"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#D5E2DA] p-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={savingResolution}
                className="rounded-lg border border-[#D5E2DA] px-5 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResolve}
                disabled={
                  !selectedAction ||
                  savingResolution ||
                  (selectedAction === "map_existing" &&
                    !mappedToBenefit) ||
                  (selectedAction === "raise_change_request" &&
                    !newFieldName.trim())
                }
                className="rounded-lg bg-[#1E5A45] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingResolution
                  ? "Saving..."
                  : "Save Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
