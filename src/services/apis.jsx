
/*
  CANOPY - API Service
  File: src/services/apis.jsx

  Backend: FastAPI
  Database: PostgreSQL

  Supports:
  - Create Project (V1)
  - List Projects
  - Reopen Project
  - Upload New Versions (V2, V3...)
  - Version History
  - Document Details
  - Benefits
  - Validation
  - Semantic Search
  - PDF Preview and Download
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "");

// --------------------------------------------
// COMMON RESPONSE HANDLER
// --------------------------------------------

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;

    let message = `Request failed (${response.status})`;

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((item) => item.msg || "Validation error")
        .join(", ");
    } else if (detail && typeof detail === "object") {
      message =
        detail.message ||
        detail.error ||
        message;
    } else if (data.message) {
      message = data.message;
    }

    const error = new Error(message);

    error.status = response.status;
    error.projectId =
      detail?.project_id ?? data.project_id ?? null;

    error.documentId =
      detail?.document_id ?? data.document_id ?? null;

    throw error;
  }

  return data;
}

// ============================================
// PROJECT APIs
// ============================================

// CREATE NEW PROJECT
// First uploaded file becomes Version 1

export async function uploadDocument(formData) {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/upload-and-extract`,
    {
      method: "POST",
      body: formData,
    }
  );

  return handleResponse(response);
}

// GET ALL PROJECTS
// Returns one row per project

export async function getProjects() {
  const response = await fetch(
    `${API_BASE_URL}/api/projects`
  );

  const data = await handleResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.projects)) {
    return data.projects;
  }

  throw new Error(
    "Invalid projects response from backend."
  );
}

// GET PROJECT DETAILS
// Used when clicking Reopen
// Includes version history

export async function getProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}`
  );

  return handleResponse(response);
}

// UPLOAD NEW VERSION
// Creates V2, V3, V4... under same project

export async function uploadProjectVersion(
  projectId,
  formData
) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  if (!(formData instanceof FormData)) {
    throw new Error(
      "A valid FormData object is required."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );

  return handleResponse(response);
}

// ============================================
// DOCUMENT APIs
// ============================================

// GET ALL DOCUMENTS
// Returns individual document versions

export async function getDocuments() {
  const response = await fetch(
    `${API_BASE_URL}/api/documents`
  );

  const data = await handleResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.documents)) {
    return data.documents;
  }

  throw new Error(
    "Invalid documents response from backend."
  );
}

// GET DOCUMENT DETAILS

export async function getDocument(documentId) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/documents/${documentId}`
  );

  return handleResponse(response);
}

// Alias for existing components

export const getDocumentDetails = getDocument;

// ============================================
// BENEFITS APIs
// ============================================

// GET EXTRACTED BENEFITS

export async function getBenefits(documentId) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/benefits/by-document/${documentId}`
  );

  return handleResponse(response);
}

// VALIDATE EXTRACTED BENEFITS

export async function validateDocumentBenefits(documentId) {
  return handleResponse(
    await fetch(
      `${API_BASE_URL}/api/benefits/validate/${documentId}`,
      { method: "POST" }
    )
  );
}


export async function searchDocuments(
  query,
  limit = 5
) {
  if (!query || !query.trim()) {
    throw new Error("Search query is required.");
  }

  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/search?${params.toString()}`
  );

  return handleResponse(response);
}

// ============================================
// ORIGINAL DOCUMENT / PDF APIs
// ============================================

// GENERATE ORIGINAL DOCUMENT URL

export function getOriginalDocumentUrl(
  documentId,
  inline = false
) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  return (
    `${API_BASE_URL}/api/documents/${documentId}` +
    `/download-original?inline=${inline}`
  );
}

// GET ORIGINAL DOCUMENT AS BLOB
// Used for PDF preview

export async function getOriginalDocument(
  documentId
) {
  const response = await fetch(
    getOriginalDocumentUrl(documentId, true)
  );

  if (!response.ok) {
    await handleResponse(response);
  }

  return response.blob();
}

// DOWNLOAD ORIGINAL DOCUMENT
// Supports PDFs and Excel files

export async function downloadOriginalDocument(
  documentId,
  filename = "document"
) {
  const response = await fetch(
    getOriginalDocumentUrl(documentId, false)
  );

  if (!response.ok) {
    await handleResponse(response);
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

export const resolveBenefit = async (
  documentId,
  benefitId,
  payload
) => {
  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000"
  ).replace(/\/+$/, "");

  const response = await fetch(
    `${baseUrl}/api/benefits/${benefitId}/resolve`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        document_id: documentId,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      `Failed to resolve benefit (HTTP ${response.status})`
    );
  }

  return data;
};
