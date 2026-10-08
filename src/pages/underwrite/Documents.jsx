import React, { useRef, useState } from "react";
import {
  Plus,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Search,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

const Documents = () => {
  const fileInputRef = useRef(null);

  // ---------------------------------------------------------
  // Create project form state
  // ---------------------------------------------------------

  const [project, setProject] = useState({
    clientName: "",
    sourceInsurer: "",
    assignedUW: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Form is CLOSED by default
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ---------------------------------------------------------
  // Previous projects
  // ---------------------------------------------------------

  const [projects] = useState([
    {
      projectId: "BEN-2026-001",
      clientName: "ABC Corporation",
      sourceInsurer: "Star Health",
      assignedUW: "John Doe",
      version: "v0.2",
      state: "Draft",
      status: "Underwriting In Progress",
    },
    {
      projectId: "BEN-2026-002",
      clientName: "XYZ Limited",
      sourceInsurer: "ICICI Lombard",
      assignedUW: "Sarah Wilson",
      version: "v1.0",
      state: "Proposal PDF",
      status: "Awaiting Sales Review",
    },
    {
      projectId: "BEN-2026-003",
      clientName: "PQR Private Limited",
      sourceInsurer: "HDFC ERGO",
      assignedUW: "John Doe",
      version: "vFINAL",
      state: "Locked",
      status: "Locked — Pending ProHealth",
    },
    {
      projectId: "BEN-2026-004",
      clientName: "Global Tech Solutions",
      sourceInsurer: "Niva Bupa",
      assignedUW: "Michael Smith",
      version: "v0.1",
      state: "Mapped",
      status: "Underwriting In Progress",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------
  // File validation
  // ---------------------------------------------------------

  const allowedExtensions = [".xlsx", ".pdf"];

  const isValidFile = (file) => {
    if (!file) return false;

    const fileName = file.name.toLowerCase();

    return allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!isValidFile(file)) {
      alert(
        "Invalid file format.\n\nPlease upload a benefit schedule in .xlsx or .pdf format."
      );

      return;
    }

    setSelectedFile(file);
  };

  // ---------------------------------------------------------
  // Browse file
  // ---------------------------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    validateAndSetFile(file);

    // Allow selecting the same file again
    event.target.value = "";
  };

  // ---------------------------------------------------------
  // Drag and drop
  // ---------------------------------------------------------

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    validateAndSetFile(file);
  };

  // ---------------------------------------------------------
  // File size formatter
  // ---------------------------------------------------------

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;

    return `${mb.toFixed(2)} MB`;
  };

  // ---------------------------------------------------------
  // File type
  // ---------------------------------------------------------

  const getFileExtension = (fileName = "") => {
    return fileName.split(".").pop()?.toLowerCase();
  };

  const isPdf = selectedFile
    ? getFileExtension(selectedFile.name) === "pdf"
    : false;

  // ---------------------------------------------------------
  // Form change
  // ---------------------------------------------------------

  const handleProjectChange = (event) => {
    const { name, value } = event.target;

    setProject((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // Reset form
  // ---------------------------------------------------------

  const resetForm = () => {
    setProject({
      clientName: "",
      sourceInsurer: "",
      assignedUW: "",
    });

    setSelectedFile(null);
  };

  // ---------------------------------------------------------
  // Create project
  // ---------------------------------------------------------

  const createProject = (event) => {
    event.preventDefault();

    if (!project.clientName.trim()) {
      alert("Please enter the client name.");
      return;
    }

    if (!project.sourceInsurer.trim()) {
      alert("Please enter the source insurer.");
      return;
    }

    if (!project.assignedUW.trim()) {
      alert("Please enter the assigned underwriter.");
      return;
    }

    if (!selectedFile) {
      alert("Please upload a benefit schedule.");
      return;
    }

    if (!isValidFile(selectedFile)) {
      alert(
        "Invalid file format.\n\nPlease upload a benefit schedule in .xlsx or .pdf format."
      );
      return;
    }

    // -------------------------------------------------------
    // Backend integration will happen here
    // -------------------------------------------------------

    console.log("Creating project:", {
      ...project,
      file: selectedFile,
      initialVersion: "v0.0",
      state: "Raw Upload",
      status: "Import Pending",
    });

    alert(
      "Project creation flow is ready for backend integration.\n\n" +
        "Initial version: v0.0\n" +
        "State: Raw Upload\n" +
        "Status: Import Pending"
    );

    // Reset form
    resetForm();

    // Close the create section after successful creation
    setShowCreateForm(false);
  };

  // ---------------------------------------------------------
  // Search previous projects
  // ---------------------------------------------------------

  const filteredProjects = projects.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      item.projectId.toLowerCase().includes(search) ||
      item.clientName.toLowerCase().includes(search) ||
      item.sourceInsurer.toLowerCase().includes(search) ||
      item.assignedUW.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search)
    );
  });

  // ---------------------------------------------------------
  // Status badge
  // ---------------------------------------------------------

  const getStatusClass = (status) => {
    if (status.includes("Locked")) {
      return "bg-[#E8F2EC] text-[#164A38] border-[#BFD8C9]";
    }

    if (status.includes("Sales")) {
      return "bg-[#F7F5EF] text-[#765D25] border-[#E6D8AE]";
    }

    if (status.includes("Underwriting")) {
      return "bg-[#E8F2EC] text-[#1E5A45] border-[#D5E2DA]";
    }

    return "bg-[#F7F5EF] text-[#385348] border-[#D5E2DA]";
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="min-h-full bg-[#F7F5EF] px-8 py-7">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#12352B]">
              Documents
            </h1>

            <p className="mt-1 text-sm text-[#66756D]">
              Create and manage benefit schedule projects.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CREATE NEW BENEFIT SCHEDULE
          COLLAPSED BY DEFAULT
      ====================================================== */}

      <div className="mb-7 overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm">
        {/* Clickable Header */}

        <button
          type="button"
          onClick={() => setShowCreateForm((previous) => !previous)}
          className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-[#F8FAF8]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8F2EC] text-[#1E5A45]">
              <Plus size={22} strokeWidth={2} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#12352B]">
                Create New Benefit Schedule
              </h2>

              <p className="mt-1 text-sm text-[#66756D]">
                Create a project and upload the source benefit schedule.
              </p>
            </div>
          </div>

          <ChevronDown
            size={21}
            className={`text-[#1E5A45] transition-transform duration-200 ${
              showCreateForm ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ===================================================
            EXPANDED FORM
        ==================================================== */}

        {showCreateForm && (
          <div className="border-t border-[#D5E2DA]">
            <form onSubmit={createProject}>
              {/* -----------------------------------------------
                  PROJECT DETAILS
              ------------------------------------------------ */}

              <div className="px-6 py-6">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#12352B]">
                    Project Details
                  </h3>

                  <p className="mt-1 text-xs text-[#74827B]">
                    Enter the basic information for the benefit schedule
                    project.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {/* Client */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#30443B]">
                      Client Name
                      <span className="ml-1 text-[#C94C4C]">*</span>
                    </label>

                    <input
                      type="text"
                      name="clientName"
                      value={project.clientName}
                      onChange={handleProjectChange}
                      placeholder="Enter client name"
                      className="w-full rounded-lg border border-[#D5E2DA] bg-white px-3.5 py-2.5 text-sm text-[#24302B] outline-none transition placeholder:text-[#9AA69F] focus:border-[#1E5A45] focus:ring-2 focus:ring-[#DCEFE3]"
                    />
                  </div>

                  {/* Source Insurer */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#30443B]">
                      Source Insurer
                      <span className="ml-1 text-[#C94C4C]">*</span>
                    </label>

                    <input
                      type="text"
                      name="sourceInsurer"
                      value={project.sourceInsurer}
                      onChange={handleProjectChange}
                      placeholder="Enter source insurer"
                      className="w-full rounded-lg border border-[#D5E2DA] bg-white px-3.5 py-2.5 text-sm text-[#24302B] outline-none transition placeholder:text-[#9AA69F] focus:border-[#1E5A45] focus:ring-2 focus:ring-[#DCEFE3]"
                    />
                  </div>

                  {/* Assigned UW */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#30443B]">
                      Assigned Underwriter
                      <span className="ml-1 text-[#C94C4C]">*</span>
                    </label>

                    <input
                      type="text"
                      name="assignedUW"
                      value={project.assignedUW}
                      onChange={handleProjectChange}
                      placeholder="Enter underwriter name"
                      className="w-full rounded-lg border border-[#D5E2DA] bg-white px-3.5 py-2.5 text-sm text-[#24302B] outline-none transition placeholder:text-[#9AA69F] focus:border-[#1E5A45] focus:ring-2 focus:ring-[#DCEFE3]"
                    />
                  </div>
                </div>
              </div>

              {/* -----------------------------------------------
                  BENEFIT SCHEDULE UPLOAD
              ------------------------------------------------ */}

              <div className="border-t border-[#D5E2DA] px-6 py-6">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#12352B]">
                    Benefit Schedule
                  </h3>

                  <p className="mt-1 text-xs text-[#74827B]">
                    Upload the original benefit schedule received from the
                    insurer.
                  </p>
                </div>

                {/* Upload area */}

                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
                    dragActive
                      ? "border-[#1E5A45] bg-[#E8F2EC]"
                      : "border-[#C9D8CF] bg-[#FBFCFA] hover:border-[#7BAE8C] hover:bg-[#F8FAF8]"
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F2EC] text-[#1E5A45]">
                    <UploadCloud size={23} />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-[#24302B]">
                    Drag and drop your benefit schedule here
                  </h4>

                  <p className="mt-1 text-sm text-[#74827B]">
                    or
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#1E5A45] bg-white px-4 py-2 text-sm font-medium text-[#1E5A45] transition hover:bg-[#E8F2EC]"
                  >
                    Browse Files
                  </button>

                  <p className="mt-3 text-xs text-[#8A9790]">
                    Supported formats: .xlsx and .pdf
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* ---------------------------------------------
                    SELECTED FILE
                ---------------------------------------------- */}

                {selectedFile && (
                  <div className="mt-4 rounded-xl border border-[#D5E2DA] bg-[#F8FAF8] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F2EC] text-[#1E5A45]">
                          {isPdf ? (
                            <FileText size={20} />
                          ) : (
                            <FileSpreadsheet size={20} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#24302B]">
                            {selectedFile.name}
                          </p>

                          <p className="mt-0.5 text-xs text-[#74827B]">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#74827B] transition hover:bg-[#EAF0EC] hover:text-[#C94C4C]"
                        title="Remove file"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {/* Valid file */}

                    <div className="mt-3 flex items-center gap-2 text-xs text-[#1E5A45]">
                      <CheckCircle2 size={15} />

                      <span>
                        File format is valid and ready for upload.
                      </span>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------
                    PDF WARNING
                ---------------------------------------------- */}

                {isPdf && (
                  <div className="mt-4 flex gap-3 rounded-xl border border-[#E6D8AE] bg-[#FFFCF3] p-4">
                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0 text-[#9A772D]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#765D25]">
                        PDF validation note
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#806E45]">
                        The uploaded PDF must contain readable text. Scanned
                        or image-only PDFs cannot be processed and will need to
                        be replaced with an Excel file or text-based PDF.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* -----------------------------------------------
                  INITIAL PROJECT STATE
              ------------------------------------------------ */}

              <div className="border-t border-[#D5E2DA] bg-[#FBFCFA] px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Version */}

                  <div className="rounded-lg border border-[#D5E2DA] bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#829089]">
                      Initial Version
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#12352B]">
                      v0.0
                    </p>
                  </div>

                  {/* State */}

                  <div className="rounded-lg border border-[#D5E2DA] bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#829089]">
                      State
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#12352B]">
                      Raw Upload
                    </p>
                  </div>

                  {/* Status */}

                  <div className="rounded-lg border border-[#D5E2DA] bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#829089]">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#1E5A45]">
                      Import Pending
                    </p>
                  </div>
                </div>

                {/* Original file information */}

                <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#D5E2DA] bg-white p-4">
                  <FolderOpen
                    size={18}
                    className="mt-0.5 shrink-0 text-[#1E5A45]"
                  />

                  <div>
                    <p className="text-sm font-medium text-[#30443B]">
                      Original file will remain untouched
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#74827B]">
                      The uploaded source document is stored as the raw
                      version. Extraction and mapping happen after the
                      project is created.
                    </p>
                  </div>
                </div>

                {/* Project ID */}

                <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#D5E2DA] bg-white p-4">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[#1E5A45]"
                  />

                  <div>
                    <p className="text-sm font-medium text-[#30443B]">
                      Project ID generated automatically
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#74827B]">
                      A unique Benefit Schedule project ID will be generated
                      when the project is created.
                    </p>
                  </div>
                </div>
              </div>

              {/* -----------------------------------------------
                  FORM ACTIONS
              ------------------------------------------------ */}

              <div className="flex items-center justify-end gap-3 border-t border-[#D5E2DA] bg-white px-6 py-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#D5E2DA] bg-white px-5 py-2.5 text-sm font-medium text-[#53645B] transition hover:bg-[#F7F5EF]"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1E5A45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#164A38]"
                >
                  Create Project
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* =====================================================
          PREVIOUS PROJECTS
      ====================================================== */}

      <section>
        {/* Section header */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#12352B]">
                Previous Projects
              </h2>

              <span className="rounded-full bg-[#E8F2EC] px-2.5 py-1 text-xs font-semibold text-[#1E5A45]">
                {projects.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-[#74827B]">
              View previously created benefit schedule projects.
            </p>
          </div>

          {/* Search */}

          <div className="relative w-full sm:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9790]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-[#D5E2DA] bg-white py-2.5 pl-9 pr-3 text-sm text-[#24302B] outline-none placeholder:text-[#9AA69F] focus:border-[#1E5A45] focus:ring-2 focus:ring-[#DCEFE3]"
            />
          </div>
        </div>

        {/* ===================================================
            PROJECT TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
              <thead>
                <tr className="border-b border-[#D5E2DA] bg-[#F8FAF8]">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Project ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Client
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Source Insurer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Assigned UW
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Version
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    State
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#66756D]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((item) => (
                    <tr
                      key={item.projectId}
                      className="border-b border-[#EDF1EE] transition hover:bg-[#FBFCFA]"
                    >
                      {/* Project ID */}

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="font-semibold text-[#1E5A45] hover:underline"
                        >
                          {item.projectId}
                        </button>
                      </td>

                      {/* Client */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#24302B]">
                          {item.clientName}
                        </p>
                      </td>

                      {/* Insurer */}

                      <td className="px-5 py-4">
                        <p className="text-sm text-[#53645B]">
                          {item.sourceInsurer}
                        </p>
                      </td>

                      {/* UW */}

                      <td className="px-5 py-4">
                        <p className="text-sm text-[#53645B]">
                          {item.assignedUW}
                        </p>
                      </td>

                      {/* Version */}

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-[#F1F5F2] px-2.5 py-1 text-xs font-semibold text-[#385348]">
                          {item.version}
                        </span>
                      </td>

                      {/* State */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-[#53645B]">
                          {item.state}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#1E5A45] transition hover:bg-[#E8F2EC]"
                        >
                          Open
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F2EC] text-[#1E5A45]">
                        <FolderOpen size={22} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-[#30443B]">
                        No projects found
                      </p>

                      <p className="mt-1 text-xs text-[#74827B]">
                        Try changing your search criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}

          <div className="flex items-center justify-between border-t border-[#D5E2DA] bg-[#FBFCFA] px-5 py-3">
            <p className="text-xs text-[#74827B]">
              Showing{" "}
              <span className="font-semibold text-[#53645B]">
                {filteredProjects.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#53645B]">
                {projects.length}
              </span>{" "}
              projects
            </p>

            <p className="text-xs text-[#8A9790]">
              Benefit Schedule Projects
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documents;