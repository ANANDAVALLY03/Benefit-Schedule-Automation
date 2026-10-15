
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FolderOpen,
  FilePlus2,
  UploadCloud,
  FileText,
  Eye,
  Download,
  History,
  X,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";

import {
  uploadDocument,
  getProjects,
  getProject,
  uploadProjectVersion,
  getOriginalDocument,
  downloadOriginalDocument,
} from "../../services/apis";


const COLORS = {
  dark: "#12352B",
  green: "#1E5A45",
  pale: "#E8F2EC",
  cream: "#F7F5EF",
  border: "#DCE5DE",
  text: "#24302B",
  muted: "#68786F",
};


const cardStyle = {
  background: "#FFFFFF",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
  padding: 24,
};


const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 9,
  padding: "10px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
};


const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatSize = (bytes) => {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};


const isPdf = (file) =>
  file?.file_extension?.toLowerCase().replace(/^\./, "") ===
  "pdf";


function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();

  const success = normalized === "completed";
  const failed = normalized === "failed";

  const color = success
    ? "#167447"
    : failed
      ? "#B42318"
      : "#9A6700";

  const background = success
    ? "#E8F7EE"
    : failed
      ? "#FEECEB"
      : "#FFF5DB";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background,
        color,
        padding: "5px 10px",
        borderRadius: 30,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {success && <CheckCircle2 size={13} />}
      {failed && <AlertCircle size={13} />}
      {normalized}
    </span>
  );
}


export default function Documents() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [clientName, setClientName] = useState("");
  const [sourceInsurer, setSourceInsurer] = useState("");
  const [assignedUW, setAssignedUW] = useState("");

  const [newFile, setNewFile] = useState(null);
  const [versionFile, setVersionFile] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const validateFile = (file) => {
    if (!file) {
      throw new Error("Please select a document.");
    }

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "xlsx", "xls", "xlsm"].includes(ext)) {
      throw new Error(
        "Please select a PDF or supported Excel file."
      );
    }
  };

  const openProject = async (projectId) => {
    clearMessages();
    setLoading(true);
    setVersionFile(null);

    try {
      const project = await getProject(projectId);
      setSelectedProject(project);
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (event) => {
    event.preventDefault();
    clearMessages();

    try {
      validateFile(newFile);

      if (
        !clientName.trim() ||
        !sourceInsurer.trim() ||
        !assignedUW.trim()
      ) {
        throw new Error(
          "Please fill in all project details."
        );
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("client_name", clientName.trim());
      formData.append("source_insurer", sourceInsurer.trim());
      formData.append(
        "assigned_underwriter",
        assignedUW.trim()
      );
      formData.append("file", newFile);

      const result = await uploadDocument(formData);

      setSuccess("Project created successfully.");

      await loadProjects();

      sessionStorage.setItem(
        "lastDocumentId",
        String(result.document_id)
      );

      navigate(
        `/underwriter/benefits?documentId=${result.document_id}`
      );
    } catch (err) {
      if (err.status === 409 && err.projectId) {
        setError(
          `${err.message} Use Reopen Project below.`
        );
      } else {
        setError(err.message);
      }

      await loadProjects();
    } finally {
      setUploading(false);
    }
  };

  
const uploadNewVersion = async (file) => {
  if (!selectedProject || !file) return;

  clearMessages();

  try {
    validateFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProjectVersion(
      selectedProject.id,
      formData
    );

    // Reload project list and version history
    await loadProjects();

    const refreshedProject = await getProject(
      selectedProject.id
    );

    setSelectedProject(refreshedProject);

    setSuccess(
      `Version V${result.version_number} uploaded and extracted successfully.`
    );

    sessionStorage.setItem(
      "lastDocumentId",
      String(result.document_id)
    );

    // Keep the reopened project visible so the user
    // can see the new active file and version history.
  } catch (err) {
    setError(err.message);

    // Refresh history even when extraction fails.
    // The previously completed version remains active.
    try {
      const refreshedProject = await getProject(
        selectedProject.id
      );

      setSelectedProject(refreshedProject);
      await loadProjects();
    } catch {
      // Preserve the existing project view.
    }
  } finally {
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};


  const openBenefits = (documentId) => {
    if (!documentId) {
      setError(
        "This project does not have a completed version yet."
      );
      return;
    }

    sessionStorage.setItem(
      "lastDocumentId",
      String(documentId)
    );

    navigate(
      `/underwriter/benefits?documentId=${documentId}`
    );
  };

  const openPdf = async (document) => {
    clearMessages();

    if (!isPdf(document)) {
      await downloadFile(document);
      return;
    }

    setPreviewLoading(true);

    try {
      const blob = await getOriginalDocument(document.id);
      const url = URL.createObjectURL(blob);

      setPreview({
        url,
        id: document.id,
        filename: document.original_filename,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadFile = async (document) => {
    clearMessages();

    try {
      await downloadOriginalDocument(
        document.id,
        document.original_filename
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const closePreview = () => setPreview(null);

  return (
    <div
      style={{
        background: COLORS.cream,
        minHeight: "100vh",
        padding: "30px",
        color: COLORS.text,
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
        }}
      >
        {/* PAGE HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                color: COLORS.dark,
              }}
            >
              Document Projects
            </h1>

            <p
              style={{
                color: COLORS.muted,
                marginTop: 7,
              }}
            >
              Create projects, reopen existing work,
              and manage benefit schedule versions.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...buttonStyle,
              background: COLORS.green,
              color: "white",
            }}
            onClick={() => {
              setSelectedProject(null);
              setShowCreate((prev) => !prev);
              clearMessages();
            }}
          >
            <FilePlus2 size={17} />
            {showCreate ? "Close Form" : "Create Project"}
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div
            role="alert"
            style={{
              padding: 14,
              background: "#FEECEB",
              color: "#B42318",
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 14,
              background: "#E8F7EE",
              color: "#167447",
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            {success}
          </div>
        )}

        {/* CREATE PROJECT */}
        {showCreate && (
          <form
            onSubmit={createProject}
            style={{
              ...cardStyle,
              marginBottom: 26,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 20 }}>
              Create New Project
            </h2>

            <p style={{ color: COLORS.muted }}>
              The first uploaded document becomes Version 1.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: "Client Name",
                  value: clientName,
                  setter: setClientName,
                },
                {
                  label: "Source Insurer",
                  value: sourceInsurer,
                  setter: setSourceInsurer,
                },
                {
                  label: "Assigned Underwriter",
                  value: assignedUW,
                  setter: setAssignedUW,
                },
              ].map((field) => (
                <label
                  key={field.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {field.label}

                  <input
                    value={field.value}
                    onChange={(e) =>
                      field.setter(e.target.value)
                    }
                    required
                    style={{
                      padding: "11px 12px",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </label>
              ))}
            </div>

            <label
              style={{
                display: "block",
                padding: 25,
                border: `2px dashed ${COLORS.border}`,
                borderRadius: 12,
                textAlign: "center",
                cursor: "pointer",
                background: COLORS.cream,
              }}
            >
              <UploadCloud
                size={30}
                color={COLORS.green}
                style={{ margin: "0 auto 10px" }}
              />

              <div style={{ fontWeight: 600 }}>
                {newFile
                  ? newFile.name
                  : "Choose a PDF or Excel document"}
              </div>

              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.xlsm"
                hidden
                onChange={(e) =>
                  setNewFile(e.target.files?.[0] || null)
                }
              />
            </label>

            <button
              type="submit"
              disabled={uploading}
              style={{
                ...buttonStyle,
                background: COLORS.green,
                color: "white",
                marginTop: 20,
                opacity: uploading ? 0.65 : 1,
              }}
            >
              {uploading ? (
                <Loader2 size={16} />
              ) : (
                <UploadCloud size={16} />
              )}

              {uploading
                ? "Uploading and extracting..."
                : "Create Project & Extract Benefits"}
            </button>
          </form>
        )}

        {/* REOPENED PROJECT */}
        {selectedProject && (
          <div
            style={{
              ...cardStyle,
              marginBottom: 26,
              border: `1px solid ${COLORS.green}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color: COLORS.green,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  REOPENED PROJECT · BEN-{selectedProject.id}
                </div>

                <h2 style={{ margin: "8px 0" }}>
                  {selectedProject.client_name}
                </h2>

                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  {selectedProject.source_insurer} ·{" "}
                  {selectedProject.assigned_underwriter}
                </p>
              </div>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background: COLORS.pale,
                  color: COLORS.dark,
                }}
                onClick={() => setSelectedProject(null)}
              >
                <X size={16} />
                Close
              </button>
            </div>

            {/* CURRENT ACTIVE VERSION */}
            <div
              style={{
                background: COLORS.pale,
                borderRadius: 12,
                padding: 18,
                marginTop: 22,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.muted,
                    }}
                  >
                    Current Active Version
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: 5,
                    }}
                  >
                    {selectedProject.active_version
                      ? `V${selectedProject.active_version.version_number} — ${selectedProject.active_version.original_filename}`
                      : "No completed version"}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!selectedProject.active_document_id}
                  style={{
                    ...buttonStyle,
                    background: COLORS.green,
                    color: "white",
                  }}
                  onClick={() =>
                    openBenefits(
                      selectedProject.active_document_id
                    )
                  }
                >
                  Open Benefits
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* UPLOAD NEW VERSION */}
            <h3 style={{ marginBottom: 8 }}>
              <RotateCcw
                size={18}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Upload New Version
            </h3>

            <p
              style={{
                color: COLORS.muted,
                fontSize: 13,
              }}
            >
              Uploading a revised document creates V
              {(selectedProject.latest_version?.version_number ||
                0) + 1}
              . Previous versions and their extracted
              benefits remain saved.
            </p>

            
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 16,
  }}
>
  {/* Hidden file input */}
  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf,.xlsx,.xls,.xlsm"
    style={{ display: "none" }}
    disabled={uploading}
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        uploadNewVersion(file);
      }
    }}
  />

  {/* Upload button opens the file picker */}
  <button
    type="button"
    disabled={uploading}
    onClick={() => fileInputRef.current?.click()}
    style={{
      ...buttonStyle,
      background: COLORS.green,
      color: "white",
      padding: "12px 20px",
      opacity: uploading ? 0.65 : 1,
    }}
  >
    {uploading ? (
      <>
        <Loader2 size={17} className="animate-spin" />
        Uploading & Extracting...
      </>
    ) : (
      <>
        <UploadCloud size={17} />
        Upload & Extract New Version
      </>
    )}
  </button>
</div>

            {/* VERSION HISTORY */}
            <h3 style={{ marginTop: 28 }}>
              <History
                size={18}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Version History
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: COLORS.pale,
                      textAlign: "left",
                    }}
                  >
                    {[
                      "Version",
                      "Source File",
                      "Uploaded",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: 13,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {(selectedProject.versions || []).map(
                    (version) => (
                      <tr
                        key={version.id}
                        style={{
                          borderBottom:
                            `1px solid ${COLORS.border}`,
                        }}
                      >
                        <td style={{ padding: 13 }}>
                          <strong>
                            V{version.version_number}
                          </strong>

                          {version.id ===
                            selectedProject.active_document_id && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "#167447",
                                fontSize: 11,
                              }}
                            >
                              Active
                            </span>
                          )}
                        </td>

                        <td style={{ padding: 13 }}>
                          {version.original_filename}
                        </td>

                        <td style={{ padding: 13 }}>
                          {formatDate(version.created_at)}
                        </td>

                        <td style={{ padding: 13 }}>
                          <StatusBadge
                            status={version.processing_status}
                          />
                        </td>

                        <td style={{ padding: 13 }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                ...buttonStyle,
                                background: COLORS.pale,
                                color: COLORS.green,
                                padding: "7px 10px",
                              }}
                              onClick={() => openPdf(version)}
                            >
                              <Eye size={14} />
                              {isPdf(version)
                                ? "Open PDF"
                                : "Download"}
                            </button>

                            <button
                              type="button"
                              style={{
                                ...buttonStyle,
                                background: "#F2F4F3",
                                color: COLORS.dark,
                                padding: "7px 10px",
                              }}
                              onClick={() =>
                                downloadFile(version)
                              }
                            >
                              <Download size={14} />
                            </button>

                            {version.processing_status ===
                              "completed" && (
                              <button
                                type="button"
                                style={{
                                  ...buttonStyle,
                                  background: COLORS.green,
                                  color: "white",
                                  padding: "7px 10px",
                                }}
                                onClick={() =>
                                  openBenefits(version.id)
                                }
                              >
                                Benefits
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PREVIOUS PROJECTS */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                Previous Projects
              </h2>

              <p
                style={{
                  color: COLORS.muted,
                  margin: "6px 0 0",
                  fontSize: 13,
                }}
              >
                One row per project. Reopen to upload
                revised benefit schedules.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProjects}
              style={{
                ...buttonStyle,
                background: COLORS.pale,
                color: COLORS.green,
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: COLORS.pale,
                    textAlign: "left",
                  }}
                >
                  {[
                    "Project",
                    "Client",
                    "Source Insurer",
                    "Underwriter",
                    "Version",
                    "Source File",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 28,
                        textAlign: "center",
                      }}
                    >
                      Loading projects...
                    </td>
                  </tr>
                )}

                {!loading && projects.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 28,
                        textAlign: "center",
                        color: COLORS.muted,
                      }}
                    >
                      No projects found. Create your
                      first project to get started.
                    </td>
                  </tr>
                )}

                {!loading &&
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      style={{
                        borderBottom:
                          `1px solid ${COLORS.border}`,
                      }}
                    >
                      <td style={{ padding: 13 }}>
                        <strong>
                          BEN-{project.id}
                        </strong>
                      </td>

                      <td style={{ padding: 13 }}>
                        {project.client_name}
                      </td>

                      <td style={{ padding: 13 }}>
                        {project.source_insurer}
                      </td>

                      <td style={{ padding: 13 }}>
                        {project.assigned_underwriter}
                      </td>

                      <td style={{ padding: 13 }}>
                        {project.active_version_number
                          ? `V${project.active_version_number}`
                          : "—"}
                      </td>

                      <td style={{ padding: 13 }}>
                        {project.active_document_id ? (
                          <button
                            type="button"
                            onClick={() =>
                              openPdf({
                                id: project.active_document_id,
                                file_extension:
                                  project.file_extension,
                                original_filename:
                                  project.original_filename,
                              })
                            }
                            style={{
                              ...buttonStyle,
                              background: COLORS.pale,
                              color: COLORS.green,
                              padding: "7px 10px",
                            }}
                          >
                            <Eye size={14} />
                            {isPdf(project)
                              ? "Open PDF"
                              : "Download"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={{ padding: 13 }}>
                        <StatusBadge
                          status={
                            project.processing_status ||
                            project.latest_processing_status
                          }
                        />
                      </td>

                      <td style={{ padding: 13 }}>
                        <button
                          type="button"
                          onClick={() =>
                            openProject(project.id)
                          }
                          style={{
                            ...buttonStyle,
                            background: COLORS.green,
                            color: "white",
                            padding: "8px 12px",
                          }}
                        >
                          <FolderOpen size={15} />
                          Reopen
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {preview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(10, 25, 18, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "white",
              width: "min(1100px, 100%)",
              height: "90vh",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottom:
                  `1px solid ${COLORS.border}`,
                gap: 12,
              }}
            >
              <strong>{preview.filename}</strong>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: COLORS.green,
                    color: "white",
                  }}
                  onClick={() =>
                    downloadOriginalDocument(
                      preview.id,
                      preview.filename
                    )
                  }
                >
                  <Download size={16} />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={closePreview}
                  style={{
                    ...buttonStyle,
                    background: "#F2F4F3",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <iframe
              title={preview.filename}
              src={preview.url}
              style={{
                width: "100%",
                flex: 1,
                border: "none",
              }}
            />
          </div>
        </div>
      )}

      {previewLoading && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: COLORS.dark,
            color: "white",
            padding: "12px 18px",
            borderRadius: 10,
          }}
        >
          Opening PDF...
        </div>
      )}
    </div>
  );
}
