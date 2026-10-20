
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "");

// ============================================
// COMMON RESPONSE HANDLER
// ============================================

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

export async function getProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}`
  );

  return handleResponse(response);
}

// UPLOAD NEW PROJECT VERSION

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


export async function updateDocumentDescription(documentId, description) {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/documents/${documentId}/description`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to save description."
    );
  }

  return data;
}


// ============================================
// DOCUMENT APIs
// ============================================

// GET ALL DOCUMENTS

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

// GET EXTRACTED BENEFITS BY DOCUMENT

export async function getBenefits(documentId) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/benefits/by-document/${documentId}`
  );

  return handleResponse(response);
}

// VALIDATE BENEFITS AND SAVE RESULTS

export async function validateDocumentBenefits(documentId) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/benefits/validate/${documentId}`,
    {
      method: "POST",
    }
  );

  return handleResponse(response);
}

// ============================================
// RESOLVE BENEFIT EXCEPTIONS
// ============================================

// Supported actions:
// 1. map_existing
// 2. mark_na
// 3. raise_change_request

export async function resolveBenefit(
  documentId,
  benefitId,
  payload
) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  if (!benefitId) {
    throw new Error("Benefit ID is required.");
  }

  const allowedActions = [
    "map_existing",
    "mark_na",
    "raise_change_request",
  ];

  if (!payload || !allowedActions.includes(payload.action)) {
    throw new Error("Invalid exception action selected.");
  }

  // Validate Map to Existing
  if (payload.action === "map_existing") {
    if (
      !payload.existing_benefit_id &&
      !payload.existing_field?.trim()
    ) {
      throw new Error(
        "Please select an existing benefit or field."
      );
    }
  }

  // Validate Raise Change Request
  if (payload.action === "raise_change_request") {
    if (!payload.new_field_name?.trim()) {
      throw new Error(
        "Please enter the new field name."
      );
    }
  }

  const requestBody = {
    document_id: Number(documentId),
    action: payload.action,
    notes: payload.notes || null,
    existing_benefit_id:
      payload.existing_benefit_id
        ? Number(payload.existing_benefit_id)
        : null,
    existing_field:
      payload.existing_field?.trim() || null,
    new_field_name:
      payload.new_field_name?.trim() || null,
  };

  const response = await fetch(
    `${API_BASE_URL}/api/benefits/${benefitId}/resolve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  return handleResponse(response);
}

// ============================================
// SEARCH DOCUMENTS
// ============================================

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


export async function getCoverageOptions(documentId) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/underwriting/${documentId}/options`
  );

  return handleResponse(response);
}

export async function saveCoverageOptions(documentId, payload) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/underwriting/${documentId}/options`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(response);
}





// GET ORIGINAL DOCUMENT AS BLOB

export async function getOriginalDocument(documentId) {
  const response = await fetch(
    getOriginalDocumentUrl(documentId, true)
  );

  if (!response.ok) {
    await handleResponse(response);
  }

  return response.blob();
}

// DOWNLOAD ORIGINAL DOCUMENT

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
