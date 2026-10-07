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
} from "lucide-react";

const Documents = () => {
  const fileInputRef = useRef(null);

  const [showProjectForm, setShowProjectForm] = useState(false);

  const [project, setProject] = useState({
    clientName: "",
    sourceInsurer: "",
    assignedUW: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleProjectChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();

    const isExcel = fileName.endsWith(".xlsx");
    const isPdf = fileName.endsWith(".pdf");

    if (!isExcel && !isPdf) {
      alert("Please upload an Excel (.xlsx) or PDF file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createProject = (e) => {
    e.preventDefault();

    if (
      !project.clientName ||
      !project.sourceInsurer ||
      !project.assignedUW
    ) {
      alert("Please fill all project details.");
      return;
    }

    setShowProjectForm(false);
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;

    const isExcel = selectedFile.name.toLowerCase().endsWith(".xlsx");

    return isExcel ? (
      <FileSpreadsheet size={28} />
    ) : (
      <FileText size={28} />
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 lg:p-8 min-h-[calc(100vh-5rem)] bg-[#F7F5EF]">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <p className="text-sm font-semibold text-[#1E5A45] mb-1">
            Underwriter Workspace
          </p>

          <h1 className="text-2xl font-bold text-[#12352B]">
            Documents
          </h1>

          <p className="text-sm text-[#60756B] mt-1">
            Create a benefit schedule project and upload the source file.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowProjectForm(true)}
          className="
            inline-flex items-center justify-center gap-2
            px-5 py-2.5
            rounded-lg
            bg-[#1E5A45]
            text-white
            text-sm font-semibold
            hover:bg-[#164A38]
            transition-colors
            shadow-sm
          "
        >
          <Plus size={18} />
          New Benefit Schedule
        </button>
      </div>

      {/* PROJECT CREATION FORM */}
      {showProjectForm && (
        <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm mb-6">

          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5E2DA]">

            <div>
              <h2 className="text-lg font-bold text-[#12352B]">
                Project Initiation
              </h2>

              <p className="text-sm text-[#6B8076] mt-1">
                Enter the details for the new benefit schedule.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowProjectForm(false)}
              className="
                w-9 h-9 rounded-lg
                flex items-center justify-center
                text-[#60756B]
                hover:bg-[#E8F2EC]
                hover:text-[#12352B]
              "
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={createProject} className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* CLIENT */}
              <div>
                <label className="block text-sm font-semibold text-[#12352B] mb-2">
                  Client Name
                </label>

                <input
                  type="text"
                  name="clientName"
                  value={project.clientName}
                  onChange={handleProjectChange}
                  placeholder="Enter client name"
                  className="
                    w-full h-11 px-3
                    rounded-lg
                    border border-[#D5E2DA]
                    bg-white
                    text-sm text-[#12352B]
                    outline-none
                    focus:border-[#1E5A45]
                    focus:ring-1
                    focus:ring-[#1E5A45]
                  "
                />
              </div>

              {/* SOURCE INSURER */}
              <div>
                <label className="block text-sm font-semibold text-[#12352B] mb-2">
                  Source Insurer
                </label>

                <input
                  type="text"
                  name="sourceInsurer"
                  value={project.sourceInsurer}
                  onChange={handleProjectChange}
                  placeholder="Enter source insurer"
                  className="
                    w-full h-11 px-3
                    rounded-lg
                    border border-[#D5E2DA]
                    bg-white
                    text-sm text-[#12352B]
                    outline-none
                    focus:border-[#1E5A45]
                    focus:ring-1
                    focus:ring-[#1E5A45]
                  "
                />
              </div>

              {/* ASSIGNED UW */}
              <div>
                <label className="block text-sm font-semibold text-[#12352B] mb-2">
                  Assigned Underwriter
                </label>

                <select
                  name="assignedUW"
                  value={project.assignedUW}
                  onChange={handleProjectChange}
                  className="
                    w-full h-11 px-3
                    rounded-lg
                    border border-[#D5E2DA]
                    bg-white
                    text-sm text-[#12352B]
                    outline-none
                    focus:border-[#1E5A45]
                    focus:ring-1
                    focus:ring-[#1E5A45]
                  "
                >
                  <option value="">
                    Select underwriter
                  </option>

                  <option value="John Doe">
                    John Doe
                  </option>

                  <option value="Sarah Wilson">
                    Sarah Wilson
                  </option>

                  <option value="Michael Smith">
                    Michael Smith
                  </option>
                </select>
              </div>
            </div>

            {/* PROJECT STATUS */}
            <div className="mt-6 p-4 rounded-lg bg-[#E8F2EC] border border-[#D5E2DA]">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#1E5A45]">
                  <FolderOpen size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#12352B]">
                    Project ID
                  </p>

                  <p className="text-xs text-[#60756B]">
                    Automatically generated when the project is created.
                  </p>
                </div>

                <span className="
                  ml-auto
                  inline-flex items-center
                  px-3 py-1
                  rounded-full
                  bg-white
                  border border-[#D5E2DA]
                  text-xs font-semibold
                  text-[#1E5A45]
                ">
                  Import Pending
                </span>

              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => setShowProjectForm(false)}
                className="
                  px-4 py-2.5
                  rounded-lg
                  border border-[#D5E2DA]
                  text-sm font-semibold
                  text-[#385348]
                  hover:bg-[#E8F2EC]
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  inline-flex items-center gap-2
                  px-5 py-2.5
                  rounded-lg
                  bg-[#1E5A45]
                  text-white
                  text-sm font-semibold
                  hover:bg-[#164A38]
                "
              >
                Create Project
                <ArrowRight size={17} />
              </button>

            </div>
          </form>
        </div>
      )}

      {/* UPLOAD SECTION */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl shadow-sm">

        <div className="px-6 py-5 border-b border-[#D5E2DA]">

          <div className="flex items-start gap-3">

            <div className="
              w-10 h-10
              rounded-lg
              bg-[#E8F2EC]
              text-[#1E5A45]
              flex items-center justify-center
              shrink-0
            ">
              <UploadCloud size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#12352B]">
                Upload Benefit Schedule
              </h2>

              <p className="text-sm text-[#6B8076] mt-1">
                Upload the source benefit schedule for extraction and mapping.
              </p>
            </div>

          </div>
        </div>

        <div className="p-6">

          {/* DROP ZONE */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed
                rounded-xl
                px-6 py-12
                text-center
                transition-all
                ${
                  dragActive
                    ? "border-[#1E5A45] bg-[#E8F2EC]"
                    : "border-[#C9D8CF] bg-[#FCFCF9] hover:border-[#7BAE8C] hover:bg-[#F8FBF9]"
                }
              `}
            >

              <div className="
                w-14 h-14
                mx-auto
                rounded-full
                bg-[#E8F2EC]
                text-[#1E5A45]
                flex items-center justify-center
                mb-4
              ">
                <UploadCloud size={28} />
              </div>

              <h3 className="text-base font-bold text-[#12352B]">
                Drag & drop your file here
              </h3>

              <p className="text-sm text-[#6B8076] mt-1">
                or
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  mt-3
                  px-4 py-2
                  rounded-lg
                  border border-[#1E5A45]
                  text-sm font-semibold
                  text-[#1E5A45]
                  hover:bg-[#E8F2EC]
                "
              >
                Browse Files
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mt-6 flex flex-wrap justify-center gap-3">

                <span className="
                  inline-flex items-center gap-1.5
                  text-xs font-medium
                  text-[#60756B]
                ">
                  <FileSpreadsheet size={15} />
                  Excel (.xlsx)
                </span>

                <span className="
                  inline-flex items-center gap-1.5
                  text-xs font-medium
                  text-[#60756B]
                ">
                  <FileText size={15} />
                  PDF
                </span>

              </div>

              <p className="text-xs text-[#7A8D84] mt-3">
                File will be checked for readability, format and size before processing.
              </p>

            </div>
          ) : (
            /* SELECTED FILE */
            <div className="
              border border-[#D5E2DA]
              rounded-xl
              bg-[#FCFCF9]
              p-5
            ">

              <div className="flex items-center gap-4">

                <div className="
                  w-12 h-12
                  rounded-lg
                  bg-[#E8F2EC]
                  text-[#1E5A45]
                  flex items-center justify-center
                  shrink-0
                ">
                  {getFileIcon()}
                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-bold text-[#12352B] truncate">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-[#6B8076] mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="
                    w-9 h-9
                    rounded-lg
                    flex items-center justify-center
                    text-[#60756B]
                    hover:bg-[#E8F2EC]
                    hover:text-[#C94C4C]
                  "
                >
                  <X size={18} />
                </button>

              </div>

              {/* VALIDATION STATUS */}
              <div className="
                mt-5
                p-4
                rounded-lg
                bg-[#E8F2EC]
                border border-[#D5E2DA]
              ">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={19}
                    className="text-[#1E5A45] mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#12352B]">
                      File ready for validation
                    </p>

                    <p className="text-xs text-[#60756B] mt-1">
                      The system will validate readability, file format and size before extraction.
                    </p>
                  </div>

                </div>
              </div>

              {/* RAW VERSION */}
              <div className="
                mt-4
                grid grid-cols-1 md:grid-cols-3
                gap-4
              ">

                <div className="p-4 rounded-lg border border-[#D5E2DA]">
                  <p className="text-xs text-[#6B8076]">
                    Version
                  </p>

                  <p className="text-sm font-bold text-[#12352B] mt-1">
                    v0.0
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[#D5E2DA]">
                  <p className="text-xs text-[#6B8076]">
                    State
                  </p>

                  <p className="text-sm font-bold text-[#12352B] mt-1">
                    Raw Upload
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[#D5E2DA]">
                  <p className="text-xs text-[#6B8076]">
                    Status
                  </p>

                  <p className="text-sm font-bold text-[#1E5A45] mt-1">
                    Import Pending
                  </p>
                </div>

              </div>

              <div className="
                mt-4
                flex items-start gap-3
                p-4
                rounded-lg
                bg-[#F7F5EF]
                border border-[#D5E2DA]
              ">

                <FolderOpen
                  size={18}
                  className="text-[#1E5A45] mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold text-[#12352B]">
                    Original file will remain untouched
                  </p>

                  <p className="text-xs text-[#6B8076] mt-1">
                    The uploaded source is stored as the v0.0 Raw Upload for version control and audit purposes.
                  </p>
                </div>

              </div>

              {/* UPLOAD BUTTON */}
              <div className="flex justify-end mt-5">

                <button
                  type="button"
                  className="
                    inline-flex items-center gap-2
                    px-5 py-2.5
                    rounded-lg
                    bg-[#1E5A45]
                    text-white
                    text-sm font-semibold
                    hover:bg-[#164A38]
                  "
                >
                  Upload & Validate
                  <ArrowRight size={17} />
                </button>

              </div>

            </div>
          )}

          {/* SCANNED PDF INFORMATION */}
          <div className="
            mt-5
            p-4
            rounded-lg
            border border-[#E8D7AD]
            bg-[#FFF9EA]
          ">

            <div className="flex items-start gap-3">

              <AlertTriangle
                size={19}
                className="text-[#B27A17] mt-0.5"
              />

              <div>

                <p className="text-sm font-semibold text-[#6F5216]">
                  Scanned PDF
                </p>

                <p className="text-xs text-[#806A39] mt-1">
                  Scanned PDFs cannot be processed as text. Please provide an
                  Excel file or a text-based PDF.
                </p>

              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Documents;