
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message || "Request failed";

    throw new Error(message);
  }

  return data;
}

export async function uploadDocument(formData) {
  return handleResponse(
    await fetch(`${API_BASE_URL}/api/documents/upload-and-extract`, {
      method: "POST",
      body: formData,
    })
  );
}

export async function getDocument(documentId) {
  return handleResponse(
    await fetch(`${API_BASE_URL}/api/documents/${documentId}`)
  );
}

export async function getBenefits(documentId) {
  return handleResponse(
    await fetch(
      `${API_BASE_URL}/api/benefits/by-document/${documentId}`
    )
  );
}

export async function validateDocumentBenefits(documentId) {
  return handleResponse(
    await fetch(
      `${API_BASE_URL}/api/benefits/validate/${documentId}`,
      { method: "POST" }
    )
  );
}


export async function searchDocuments(query, limit = 5) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  return handleResponse(
    await fetch(`${API_BASE_URL}/api/search?${params}`)
  );
}
export function getOriginalDocumentUrl(documentId, inline = false) {
  const url =
    `${API_BASE_URL}/api/documents/${documentId}/download-original`;

  return inline ? `${url}?inline=true` : url;
}