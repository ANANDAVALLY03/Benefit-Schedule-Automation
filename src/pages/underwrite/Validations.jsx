
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
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  getProjects,
  getDocuments,
  getBenefits,
  validateDocumentBenefits,
} from "../../services/apis";

// ============================================
// HELPERS
// ============================================

const asArray = (data, key) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.[key])
      ? data[key]
      : [];

const idOf = (item) =>
  item?.id ?? item?.document_id;

const projectIdOf = (item) =>
  item?.project_id ??
  item?.projectId ??
  item?.project?.id;

const projectName = (project) =>
  project?.project_name ||
  project?.name ||
  project?.client_name ||
  `Project ${project?.id}`;

const documentName = (doc) =>
  doc?.original_filename ||
  doc?.filename ||
  doc?.file_name ||
  `Document ${idOf(doc)}`;

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

// ============================================
// PARSE OTHER ATTRIBUTES
// ============================================

const parseAttributes = (value) => {
  if (!value) {
    return {};
  }

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

// ============================================
// UNDERWRITER RESOLUTION
// ============================================

const resolutionOf = (benefit) => {
  const attributes = parseAttributes(
    benefit?.other_attributes
  );

  return (
    attributes.underwriter_resolution || {}
  );
};

const isReviewCompleted = (benefit) => {
  const resolution = resolutionOf(benefit);

  return (
    normalize(resolution.review_status) ===
      "completed" &&
    [
      "map_existing",
      "mark_na",
      "raise_change_request",
    ].includes(resolution.action)
  );
};

// ============================================
// NORMALIZE DISPLAY STATUS
// ============================================

const statusOf = (benefit) => {
  const resolution = resolutionOf(benefit);

  const completed =
    isReviewCompleted(benefit);

  const action = resolution.action;

  const approvalStatus = normalize(
    resolution.approval_status
  );

  // Underwriter submitted a change request.
  // This is NOT final master approval.
  if (
    action === "raise_change_request" &&
    completed
  ) {
    if (approvalStatus === "approved") {
      return "change_approved";
    }

    if (approvalStatus === "rejected") {
      return "change_rejected";
    }

    return "admin_pending";
  }

  // Underwriter marked benefit as N/A.
  if (
    action === "mark_na" &&
    completed
  ) {
    return "excluded";
  }

  // Underwriter completed provisional mapping.
  if (
    action === "map_existing" &&
    completed
  ) {
    return "passed";
  }

  // Fall back to validation_status from backend.
  const status = normalize(
    benefit?.validation_status ??
    benefit?.status ??
    "Unverified"
  );

  if (
    [
      "valid",
      "verified",
      "validated",
      "passed",
    ].includes(status)
  ) {
    return "passed";
  }

  if (
    [
      "n/a",
      "na",
      "not applicable",
      "excluded",
    ].includes(status)
  ) {
    return "excluded";
  }

  if (
    [
      "mismatch",
      "invalid",
      "conflict",
      "failed",
      "error",
    ].includes(status)
  ) {
    return "error";
  }

  if (
    status === "change requested"
  ) {
    return "admin_pending";
  }

  return "review";
};

// ============================================
// UNDERWRITER COMPLETION
// ============================================

const isUnderwriterComplete = (benefit) => {
  const status = statusOf(benefit);

  return [
    "passed",
    "excluded",
    "admin_pending",
    "change_approved",
    "change_rejected",
  ].includes(status);
};

// ============================================
// VALIDATION REASON
// ============================================

const reasonOf = (benefit) => {
  const resolution = resolutionOf(benefit);

  if (isReviewCompleted(benefit)) {
    if (
      resolution.action ===
      "raise_change_request"
    ) {
      const fieldName =
        resolution.new_field_name;

      const approval = normalize(
        resolution.approval_status
      );

      if (approval === "approved") {
        return fieldName
          ? `Change request approved for new field: ${fieldName}.`
          : "Change request approved.";
      }

      if (approval === "rejected") {
        return fieldName
          ? `Change request rejected for new field: ${fieldName}.`
          : "Change request rejected.";
      }

      return fieldName
        ? `New field "${fieldName}" requested. Awaiting Admin approval.`
        : "Change request submitted. Awaiting Admin approval.";
    }

    if (
      resolution.action === "mark_na"
    ) {
      return "Marked as not applicable by Underwriter.";
    }

    if (
      resolution.action === "map_existing"
    ) {
      return "Underwriter mapping review completed. Master mapping pending.";
    }
  }

  return (
    benefit.validation_reason || "—"
  );
};

// ============================================
// SUMMARY CALCULATION
// ============================================

const summaryOf = (items) => {
  const summary = {
    total: items.length,
    passed: 0,
    review: 0,
    errors: 0,
    excluded: 0,
    adminPending: 0,
    changeApproved: 0,
    changeRejected: 0,
    completed: 0,
    percent: 0,
  };

  items.forEach((item) => {
    const status = statusOf(item);

    if (status === "passed") {
      summary.passed++;
    } else if (status === "excluded") {
      summary.excluded++;
    } else if (status === "error") {
      summary.errors++;
    } else if (status === "admin_pending") {
      summary.adminPending++;
    } else if (status === "change_approved") {
      summary.changeApproved++;
    } else if (status === "change_rejected") {
      summary.changeRejected++;
    } else {
      summary.review++;
    }

    if (isUnderwriterComplete(item)) {
      summary.completed++;
    }
  });

  summary.percent = summary.total
    ? Math.round(
        (summary.completed /
          summary.total) *
          100
      )
    : 0;

  return summary;
};

// ============================================
// STATUS DISPLAY
// ============================================

function BenefitStatus({ status }) {
  if (status === "passed") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-green-700">
        <CheckCircle2 size={17} />
        Validated
      </span>
    );
  }

  if (status === "excluded") {
    return (
      <span className="font-medium text-slate-600">
        N/A
      </span>
    );
  }

  if (status === "admin_pending") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-purple-700">
        <Clock3 size={16} />
        Pending Admin Approval
      </span>
    );
  }

  if (status === "change_approved") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-green-700">
        <CheckCircle2 size={17} />
        Change Approved
      </span>
    );
  }

  if (status === "change_rejected") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-red-700">
        <XCircle size={16} />
        Change Rejected
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-red-700">
        <XCircle size={16} />
        Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
      <AlertTriangle size={16} />
      Needs Review
    </span>
  );
}

// ============================================
// VALIDATIONS PAGE
// ============================================

export default function Validations() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [
    benefitsByDocument,
    setBenefitsByDocument,
  ] = useState({});

  const [
    documentErrors,
    setDocumentErrors,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [runningId, setRunningId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    expandedProject,
    setExpandedProject,
  ] = useState(null);

  const [
    expandedDocument,
    setExpandedDocument,
  ] = useState(null);

  // ============================================
  // SELECTED DOCUMENT
  // ============================================

  const selectedDocumentId =
    new URLSearchParams(
      location.search
    ).get("documentId") ||
    location.state?.documentId ||
    null;

  // ============================================
  // LOAD PROJECTS, DOCUMENTS AND BENEFITS
  // ============================================

  const load = useCallback(
    async (initial = false) => {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const [
          projectRows,
          documentRows,
        ] = await Promise.all([
          getProjects(),
          getDocuments(),
        ]);

        const allProjects = asArray(
          projectRows,
          "projects"
        );

        const allDocuments = asArray(
          documentRows,
          "documents"
        );

        setProjects(allProjects);
        setDocuments(allDocuments);

        const validDocuments =
          allDocuments.filter(
            (doc) =>
              idOf(doc) != null
          );

        const results =
          await Promise.allSettled(
            validDocuments.map(
              async (doc) => ({
                id: String(idOf(doc)),
                data: asArray(
                  await getBenefits(
                    idOf(doc)
                  ),
                  "benefits"
                ),
              })
            )
          );

        const byId = {};
        const failures = {};

        results.forEach(
          (result, index) => {
            const doc =
              validDocuments[index];

            const documentId =
              String(idOf(doc));

            if (
              result.status ===
              "fulfilled"
            ) {
              byId[documentId] =
                result.value.data;
            } else {
              failures[documentId] =
                result.reason?.message ||
                "Unable to load benefits";
            }
          }
        );

        setBenefitsByDocument(byId);
        setDocumentErrors(failures);

        // Expand selected document automatically
        if (selectedDocumentId) {
          const selected =
            allDocuments.find(
              (doc) =>
                String(idOf(doc)) ===
                String(
                  selectedDocumentId
                )
            );

          if (selected) {
            setExpandedDocument(
              String(
                selectedDocumentId
              )
            );

            if (
              projectIdOf(selected) !=
              null
            ) {
              setExpandedProject(
                String(
                  projectIdOf(
                    selected
                  )
                )
              );
            }
          }
        }
      } catch (err) {
        setError(
          err.message ||
          "Unable to load projects and documents."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedDocumentId]
  );

  // ============================================
  // FETCH WHEN PAGE OPENS
  // ============================================

  useEffect(() => {
    load(true);
  }, [load]);

  // ============================================
  // REFRESH WHEN BROWSER GETS FOCUS
  // ============================================

  useEffect(() => {
    const onFocus = () => {
      load(false);
    };

    window.addEventListener(
      "focus",
      onFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        onFocus
      );
    };
  }, [load]);

  // ============================================
  // GROUP PROJECTS AND DOCUMENTS
  // ============================================

  const groupedProjects = useMemo(() => {
    return projects.map(
      (project) => {
        const projectId = String(
          project.id ??
          project.project_id
        );

        const docs =
          documents.filter(
            (doc) =>
              String(
                projectIdOf(doc)
              ) === projectId
          );

        const benefits =
          docs.flatMap(
            (doc) =>
              benefitsByDocument[
                String(idOf(doc))
              ] || []
          );

        return {
          ...project,
          projectId,
          docs,
          summary:
            summaryOf(benefits),
          loadErrors:
            docs.filter(
              (doc) =>
                documentErrors[
                  String(
                    idOf(doc)
                  )
                ]
            ).length,
        };
      }
    );
  }, [
    projects,
    documents,
    benefitsByDocument,
    documentErrors,
  ]);

  const filtered =
    groupedProjects.filter(
      (project) =>
        `${projectName(project)} ${project.projectId}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const allSummary = summaryOf(
    Object.values(
      benefitsByDocument
    ).flat()
  );

  // ============================================
  // REVALIDATE DOCUMENT
  // ============================================

  const runValidation = async (
    documentId
  ) => {
    setRunningId(
      String(documentId)
    );

    setError("");

    try {
      await validateDocumentBenefits(
        Number(documentId)
      );

      await load(false);
    } catch (err) {
      setError(
        err.message ||
        "Validation failed."
      );
    } finally {
      setRunningId(null);
    }
  };

  // ============================================
  // NAVIGATE TO EXCEPTIONS
  // ============================================

  const goToExceptions = (
    documentId,
    projectId,
    benefitId = null
  ) => {
    const params =
      new URLSearchParams({
        documentId:
          String(documentId),
      });

    if (benefitId != null) {
      params.set(
        "benefitId",
        String(benefitId)
      );
    }

    navigate(
      `/underwriter/exceptions?${params.toString()}`,
      {
        state: {
          documentId,
          projectId,
          benefitId,
        },
      }
    );
  };

  // ============================================
  // STATUS PILL
  // ============================================

  const pill = (
    label,
    count,
    color
  ) => (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}
    >
      {count} {label}
    </span>
  );

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-[calc(100vh-5rem)] space-y-5 bg-[#F7F5EF] p-4 lg:p-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-bold text-[#12352B]">
            Project Validations
          </h1>

          <p className="mt-1 text-sm text-[#60756B]">
            Review validation results for every project
            and document.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            load(false)
          }
          disabled={
            loading ||
            refreshing
          }
          className="flex items-center gap-2 rounded-lg bg-[#1E5A45] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* GLOBAL SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

        {[
          [
            "Projects",
            projects.length,
            "text-[#12352B]",
          ],
          [
            "Total Checks",
            allSummary.total,
            "text-[#12352B]",
          ],
          [
            "Passed",
            allSummary.passed,
            "text-green-700",
          ],
          [
            "Needs Review",
            allSummary.review,
            "text-amber-700",
          ],
          [
            "Errors",
            allSummary.errors,
            "text-red-700",
          ],
        ].map(
          ([
            label,
            value,
            color,
          ]) => (
            <div
              key={label}
              className="rounded-xl border border-[#D5E2DA] bg-white p-4"
            >
              <p className="text-xs text-[#60756B]">
                {label}
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${color}`}
              >
                {value}
              </p>
            </div>
          )
        )}
      </div>

      {/* SEARCH */}
      <div className="rounded-xl border border-[#D5E2DA] bg-white p-4">

        <div className="relative">

          <Search
            size={17}
            className="absolute left-3 top-3 text-[#71837B]"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search projects..."
            className="h-10 w-full rounded-lg border border-[#D5E2DA] pl-10 pr-3 text-sm outline-none focus:border-[#1E5A45]"
          />
        </div>
      </div>

      {/* PROJECT LIST */}
      {loading ? (
        <p className="py-12 text-center text-sm text-[#60756B]">
          Loading projects and validations...
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-[#60756B]">
          No projects found.
        </p>
      ) : (
        filtered.map(
          (project) => {
            const open =
              expandedProject ===
              project.projectId;

            return (
              <section
                key={
                  project.projectId
                }
                className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm"
              >

                {/* PROJECT HEADER */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedProject(
                      open
                        ? null
                        : project.projectId
                    )
                  }
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left hover:bg-[#F2F7F4]"
                >

                  <div className="flex items-center gap-3">

                    {open ? (
                      <ChevronDown
                        size={19}
                      />
                    ) : (
                      <ChevronRight
                        size={19}
                      />
                    )}

                    <div>
                      <h2 className="font-bold text-[#12352B]">
                        {projectName(
                          project
                        )}
                      </h2>

                      <p className="text-xs text-[#71837B]">
                        Project ID:{" "}
                        {
                          project.projectId
                        }
                        {" · "}
                        {
                          project.docs
                            .length
                        }{" "}
                        document(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    {pill(
                      "passed",
                      project.summary
                        .passed,
                      "bg-green-50 text-green-700"
                    )}

                    {pill(
                      "review",
                      project.summary
                        .review,
                      "bg-amber-50 text-amber-700"
                    )}

                    {pill(
                      "errors",
                      project.summary
                        .errors,
                      "bg-red-50 text-red-700"
                    )}

                    {project.summary
                      .adminPending > 0 &&
                      pill(
                        "admin pending",
                        project.summary
                          .adminPending,
                        "bg-purple-50 text-purple-700"
                      )}

                    <span className="font-bold text-[#1E5A45]">
                      {
                        project.summary
                          .percent
                      }
                      %
                    </span>
                  </div>
                </button>

                {/* PROGRESS BAR */}
                <div className="h-1.5 bg-[#E6ECE9]">

                  <div
                    className="h-full bg-[#1E8E68]"
                    style={{
                      width: `${project.summary.percent}%`,
                    }}
                  />
                </div>

                {/* DOCUMENTS */}
                {open && (
                  <div className="space-y-3 border-t border-[#E5ECE8] p-4">

                    {project.docs.length ===
                      0 && (
                      <p className="text-sm text-[#71837B]">
                        No documents linked
                        to this project.
                      </p>
                    )}

                    {project.docs.map(
                      (doc) => {
                        const documentId =
                          String(
                            idOf(doc)
                          );

                        const benefits =
                          benefitsByDocument[
                            documentId
                          ] || [];

                        const stats =
                          summaryOf(
                            benefits
                          );

                        const docOpen =
                          expandedDocument ===
                          documentId;

                        return (
                          <div
                            key={
                              documentId
                            }
                            className="overflow-hidden rounded-lg border border-[#D5E2DA]"
                          >

                            {/* DOCUMENT HEADER */}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDocument(
                                  docOpen
                                    ? null
                                    : documentId
                                )
                              }
                              className="flex w-full flex-wrap items-center justify-between gap-3 bg-[#FAFCFB] p-4 text-left"
                            >

                              <div className="flex items-center gap-2">

                                <FileText
                                  size={17}
                                  className="text-[#1E5A45]"
                                />

                                <div>
                                  <p className="text-sm font-semibold text-[#29483D]">
                                    {documentName(
                                      doc
                                    )}
                                  </p>

                                  <p className="text-xs text-[#71837B]">
                                    Document ID:{" "}
                                    {
                                      documentId
                                    }
                                    {" · "}
                                    {
                                      stats.total
                                    }{" "}
                                    benefit(s)
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">

                                <span className="text-xs text-[#60756B]">
                                  {
                                    stats.percent
                                  }
                                  % complete
                                </span>

                                {docOpen ? (
                                  <ChevronDown
                                    size={17}
                                  />
                                ) : (
                                  <ChevronRight
                                    size={17}
                                  />
                                )}
                              </div>
                            </button>

                            {/* DOCUMENT CONTENT */}
                            {docOpen && (
                              <div className="p-4">

                                {/* DOCUMENT SUMMARY */}
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

                                  <div className="flex flex-wrap gap-2">

                                    {pill(
                                      "passed",
                                      stats.passed,
                                      "bg-green-50 text-green-700"
                                    )}

                                    {pill(
                                      "review",
                                      stats.review,
                                      "bg-amber-50 text-amber-700"
                                    )}

                                    {pill(
                                      "errors",
                                      stats.errors,
                                      "bg-red-50 text-red-700"
                                    )}

                                    {pill(
                                      "N/A",
                                      stats.excluded,
                                      "bg-slate-100 text-slate-600"
                                    )}

                                    {stats.adminPending >
                                      0 &&
                                      pill(
                                        "admin pending",
                                        stats.adminPending,
                                        "bg-purple-50 text-purple-700"
                                      )}
                                  </div>

                                  {/* ACTION BUTTONS */}
                                  <div className="flex flex-wrap gap-2">

                                    <button
                                      type="button"
                                      disabled={
                                        runningId ===
                                        documentId
                                      }
                                      onClick={() =>
                                        runValidation(
                                          documentId
                                        )
                                      }
                                      className="flex items-center gap-1 rounded-lg border border-[#1E5A45] px-3 py-2 text-xs font-semibold text-[#1E5A45] disabled:opacity-50"
                                    >
                                      <RefreshCw
                                        size={14}
                                        className={
                                          runningId ===
                                          documentId
                                            ? "animate-spin"
                                            : ""
                                        }
                                      />

                                      Re-validate
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        goToExceptions(
                                          documentId,
                                          project.projectId
                                        )
                                      }
                                      className="flex items-center gap-1 rounded-lg bg-[#1E5A45] px-3 py-2 text-xs font-semibold text-white"
                                    >
                                      <AlertTriangle
                                        size={14}
                                      />
                                      View Exceptions
                                    </button>
                                  </div>
                                </div>

                                {/* BENEFITS TABLE */}
                                {documentErrors[
                                  documentId
                                ] ? (
                                  <p className="text-sm text-red-700">
                                    {
                                      documentErrors[
                                        documentId
                                      ]
                                    }
                                  </p>
                                ) : benefits.length ===
                                  0 ? (
                                  <p className="text-sm text-[#71837B]">
                                    No extracted benefits
                                    available for this
                                    document.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">

                                    <table className="w-full min-w-[700px] text-left text-sm">

                                      <thead className="bg-[#F2F7F4] text-xs text-[#526C61]">
                                        <tr>
                                          <th className="p-3">
                                            Benefit
                                          </th>

                                          <th className="p-3">
                                            Category
                                          </th>

                                          <th className="p-3">
                                            Validation Reason
                                          </th>

                                          <th className="p-3">
                                            Status
                                          </th>

                                          <th className="p-3">
                                            Action
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {benefits.map(
                                          (
                                            benefit,
                                            index
                                          ) => {
                                            const status =
                                              statusOf(
                                                benefit
                                              );

                                            const completed =
                                              isUnderwriterComplete(
                                                benefit
                                              );

                                            return (
                                              <tr
                                                key={
                                                  benefit.id ??
                                                  index
                                                }
                                                className="border-t border-[#E5ECE8]"
                                              >

                                                <td className="p-3 font-medium text-[#29483D]">
                                                  {benefit.benefit_name ||
                                                    `Benefit ${index + 1}`}
                                                </td>

                                                <td className="p-3 text-[#60756B]">
                                                  {benefit.benefit_category ||
                                                    "—"}
                                                </td>

                                                <td className="p-3 text-[#60756B]">
                                                  {reasonOf(
                                                    benefit
                                                  )}
                                                </td>

                                                {/* STATUS */}
                                                <td className="p-3">
                                                  <BenefitStatus
                                                    status={
                                                      status
                                                    }
                                                  />
                                                </td>

                                                {/* ACTION */}
                                                <td className="p-3">

                                                  {completed ? (
                                                    <span className="text-xs text-[#71837B]">
                                                      —
                                                    </span>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      disabled={
                                                        benefit.id ==
                                                        null
                                                      }
                                                      onClick={() =>
                                                        goToExceptions(
                                                          documentId,
                                                          project.projectId,
                                                          benefit.id
                                                        )
                                                      }
                                                      className="rounded-lg border border-[#1E5A45] px-3 py-1.5 text-xs font-semibold text-[#1E5A45] hover:bg-[#E8F2EC] disabled:opacity-50"
                                                    >
                                                      Review
                                                    </button>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            );
          }
        )
      )}

      {/* FOOTER NOTE */}
      <p className="text-xs text-[#71837B]">
        Completion percentage measures Underwriter
        review progress. Completed mappings and N/A
        decisions count toward completion. Submitted
        change requests also count as Underwriter
        reviews completed, but remain pending Admin
        approval. Final CANOPY master mapping and
        approval are separate steps.
      </p>
    </div>
  );
}
