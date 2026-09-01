const FIREBASE_API_KEY = "AIzaSyDaV2ARQU9EwLKo3mN02VoIiwm4w7jksOo";
const DATABASE_ROOT =
  "https://portfolio-6a1b9-default-rtdb.firebaseio.com/scholarresume";
const SESSION_PREFIX = "scholarresume.v1.";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(event.request, url));
  }
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function apiError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function encodeSession(session) {
  const value = btoa(JSON.stringify(session))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${SESSION_PREFIX}${value}`;
}

function decodeSession(token) {
  if (!token.startsWith(SESSION_PREFIX)) {
    return { idToken: token, expiresAt: Date.now() + 5 * 60 * 1000 };
  }
  const value = token.slice(SESSION_PREFIX.length).replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  return JSON.parse(atob(value + padding));
}

async function refreshSession(session) {
  if (!session.refreshToken || Number(session.expiresAt) > Date.now() + 60_000) {
    return session;
  }
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
      }),
    },
  );
  const payload = await response.json();
  if (!response.ok) throw apiError("Session expired", 401);
  return {
    idToken: payload.id_token,
    refreshToken: payload.refresh_token || session.refreshToken,
    uid: payload.user_id || session.uid,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
  };
}

async function authenticate(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) throw apiError("Unauthorized", 401);
  try {
    return await refreshSession(decodeSession(authorization.slice(7)));
  } catch {
    throw apiError("Unauthorized", 401);
  }
}

async function identityRequest(endpoint, body) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const payload = await response.json();
  if (!response.ok) {
    const code = String(payload?.error?.message || "");
    if (["EMAIL_NOT_FOUND", "INVALID_PASSWORD", "INVALID_LOGIN_CREDENTIALS"].includes(code)) {
      throw apiError("Invalid credentials", 401);
    }
    if (code === "EMAIL_EXISTS") throw apiError("Email already exists", 400);
    if (code.startsWith("WEAK_PASSWORD")) {
      throw apiError("Password must be at least 8 characters", 400);
    }
    throw apiError("Authentication service unavailable", 503);
  }
  return payload;
}

async function databaseRequest(path, options = {}) {
  const url = new URL(`${DATABASE_ROOT}/${path}.json`);
  if (options.token) url.searchParams.set("auth", options.token);
  for (const [key, value] of Object.entries(options.query || {})) {
    url.searchParams.set(key, JSON.stringify(value));
  }
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw apiError("Unauthorized", 401);
    }
    throw apiError("Data service unavailable", 503);
  }
  return response.status === 204 ? null : response.json();
}

function publicUser(uid, email, profile = {}, displayName = null) {
  return {
    id: uid,
    email,
    full_name: profile.full_name || displayName || null,
    avatar_url: profile.avatar_url || null,
    oauth_provider: profile.oauth_provider || null,
    oauth_provider_id: profile.oauth_provider_id || null,
    last_login_at: profile.last_login_at || null,
    created_at: profile.created_at || null,
  };
}

function sessionFromIdentity(payload) {
  return {
    idToken: payload.idToken,
    refreshToken: payload.refreshToken,
    uid: payload.localId,
    expiresAt: Date.now() + Number(payload.expiresIn || 3600) * 1000,
  };
}

function passwordError(password) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/\d/.test(password)) return "Password must contain a digit";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain a special character";
  return null;
}

async function login(request) {
  const { email, password } = await readJson(request);
  if (!email || !password) throw apiError("Missing fields");
  const identity = await identityRequest("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
  const session = sessionFromIdentity(identity);
  const profile =
    (await databaseRequest(`users/${session.uid}`, { token: session.idToken })) || {};
  const lastLoginAt = new Date().toISOString();
  await databaseRequest(`users/${session.uid}`, {
    method: "PATCH",
    token: session.idToken,
    body: { last_login_at: lastLoginAt },
  });
  return jsonResponse({
    token: encodeSession(session),
    user: publicUser(
      session.uid,
      identity.email,
      { ...profile, last_login_at: lastLoginAt },
      identity.displayName,
    ),
  });
}

async function register(request) {
  const { full_name, email, password } = await readJson(request);
  if (!email || !password) throw apiError("Missing fields");
  const validationError = passwordError(String(password));
  if (validationError) throw apiError(validationError);
  const identity = await identityRequest("accounts:signUp", {
    email,
    password,
    returnSecureToken: true,
  });
  if (full_name) {
    await identityRequest("accounts:update", {
      idToken: identity.idToken,
      displayName: full_name,
      returnSecureToken: false,
    });
  }
  const session = sessionFromIdentity(identity);
  const profile = {
    id: session.uid,
    email: identity.email,
    full_name: full_name || null,
    created_at: new Date().toISOString(),
  };
  await databaseRequest(`users/${session.uid}`, {
    method: "PUT",
    token: session.idToken,
    body: profile,
  });
  return jsonResponse({
    token: encodeSession(session),
    user: publicUser(session.uid, identity.email, profile, full_name),
  });
}

async function currentUser(request) {
  const session = await authenticate(request);
  const [lookup, profile] = await Promise.all([
    identityRequest("accounts:lookup", { idToken: session.idToken }),
    databaseRequest(`users/${session.uid}`, { token: session.idToken }),
  ]);
  const account = lookup.users?.[0];
  if (!account) throw apiError("Unauthorized", 401);
  return jsonResponse({
    user: publicUser(session.uid, account.email, profile || {}, account.displayName),
  });
}

async function listResumes(request) {
  const session = await authenticate(request);
  const records =
    (await databaseRequest("resumes", {
      token: session.idToken,
      query: { orderBy: "user_id", equalTo: session.uid },
    })) || {};
  return jsonResponse(
    Object.values(records).sort((a, b) =>
      String(b.updated_at).localeCompare(String(a.updated_at)),
    ),
  );
}

async function createResume(request) {
  const session = await authenticate(request);
  const body = await readJson(request);
  const now = new Date().toISOString();
  const resume = {
    id: crypto.randomUUID(),
    user_id: session.uid,
    title: body.title || "Academic Resume",
    data: body.data || {},
    template_name: body.template_name || "default",
    created_at: now,
    updated_at: now,
  };
  await databaseRequest(`resumes/${resume.id}`, {
    method: "PUT",
    token: session.idToken,
    body: resume,
  });
  return jsonResponse(resume);
}

async function resumeById(request, id) {
  const session = await authenticate(request);
  const resume = await databaseRequest(`resumes/${id}`, { token: session.idToken });
  if (!resume || resume.user_id !== session.uid) throw apiError("Not found", 404);
  if (request.method === "GET") return jsonResponse(resume);
  if (request.method === "DELETE") {
    await databaseRequest(`resumes/${id}`, {
      method: "DELETE",
      token: session.idToken,
    });
    return jsonResponse({ ok: true });
  }
  const body = await readJson(request);
  const updated = {
    ...resume,
    title: body.title || "Academic Resume",
    data: body.data || {},
    updated_at: new Date().toISOString(),
  };
  await databaseRequest(`resumes/${id}`, {
    method: "PUT",
    token: session.idToken,
    body: updated,
  });
  return jsonResponse(updated);
}

function htmlToPlainText(html) {
  return String(html || "ScholarResume")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function wrapText(text, width = 92) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      if (line && line.length + word.length + 1 > width) {
        lines.push(line);
        line = word;
      } else {
        line += `${line ? " " : ""}${word}`;
      }
    }
    lines.push(line);
  }
  return lines.length ? lines : ["ScholarResume"];
}

function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(text) {
  const lines = wrapText(text);
  const pageLines = [];
  for (let index = 0; index < lines.length; index += 54) {
    pageLines.push(lines.slice(index, index + 54));
  }
  const pageObjectIds = pageLines.map((_, index) => 4 + index * 2);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageLines.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  for (let index = 0; index < pageLines.length; index += 1) {
    const contentId = 5 + index * 2;
    const commands = ["BT", "/F1 10 Tf", "42 800 Td", "13 TL"];
    for (const line of pageLines[index]) commands.push(`(${escapePdfText(line)}) Tj`, "T*");
    commands.push("ET");
    const stream = commands.join("\n");
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  }
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

async function pdfPreview(request) {
  await authenticate(request);
  return jsonResponse(
    { error: "Use the Download PDF button to open Chrome's high-quality Save as PDF view." },
    503,
  );
}

async function handleApiRequest(request, url) {
  try {
    const path = url.pathname.replace(/\/+$/, "");
    if (request.method === "GET" && path === "/api/health") {
      return jsonResponse({ ok: true, service: "scholarresume-firebase" });
    }
    if (request.method === "GET" && path === "/api/config") {
      const settings = await databaseRequest("settings");
      return jsonResponse(settings || {
        admin_inactivity_timeout: "30",
        user_inactivity_timeout: "30",
        card_border_radius: "0.6rem",
        card_gap: "1rem",
      });
    }
    if (request.method === "GET" && path === "/api/auth/providers") {
      return jsonResponse({ google: false, facebook: false, dev: false });
    }
    if (request.method === "POST" && path === "/api/auth/login") return await login(request);
    if (request.method === "POST" && path === "/api/auth/register") return await register(request);
    if (request.method === "GET" && path === "/api/auth/me") return await currentUser(request);
    if (request.method === "GET" && path === "/api/resumes") return await listResumes(request);
    if (request.method === "POST" && path === "/api/resumes") return await createResume(request);
    if (request.method === "POST" && path === "/api/pdf/preview") return await pdfPreview(request);
    const resumeMatch = path.match(/^\/api\/resumes\/([^/]+)$/);
    if (resumeMatch && ["GET", "PUT", "DELETE"].includes(request.method)) {
      return await resumeById(request, decodeURIComponent(resumeMatch[1]));
    }
    if (request.method === "GET" && path === "/api/admin/login-config") {
      return jsonResponse({ error: "Admin login is available on the local installation" }, 503);
    }
    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    return jsonResponse({ error: error?.message || "Network Error" }, Number(error?.status) || 500);
  }
}
