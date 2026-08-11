// Client-side fetch helper. Always same-origin (/api/proxy/... or /api/login) —
// the JWT lives only in an httpOnly cookie, never in browser-accessible JS.
async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api/proxy/${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && typeof window !== "undefined") {
    // Never bounce to /login while already there: the provider in the root
    // layout calls auth/me on every mount, so redirecting would hard-reload
    // the page, re-mount, 401 again — an endless reload loop.
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return null;
  }

  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.details = data.details;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export async function uploadFile(file, { folder, resourceType = "image" } = {}) {
  const dataUri = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const { media } = await api.post("media/upload", { file: dataUri, folder, resourceType });
  return { ...media, type: resourceType, alt: "" };
}
