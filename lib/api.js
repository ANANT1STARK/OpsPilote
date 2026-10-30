const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
const WORKSPACE_ID = (process.env.NEXT_PUBLIC_WORKSPACE_ID || "").trim();

export async function apiGet(path) {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in .env.local.");
  }

  const url = new URL(`${API_BASE_URL}${path}`);

  if (WORKSPACE_ID) {
    url.searchParams.set("workspace_id", WORKSPACE_ID);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `API request failed: ${response.status}`
    );
  }

  return data;
}

export async function apiPost(path, body) {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in .env.local.");
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error("Could not reach the FastAPI server. Check that the backend is running and CORS allows this frontend origin.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = typeof data === "object" && data !== null ? data.detail : data;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || JSON.stringify(item)).join("; ")
      : typeof detail === "string" ? detail : `API request failed: ${response.status}`;
    throw new Error(message || `API request failed: ${response.status}`);
  }

  return data;
}
