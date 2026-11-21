// Netlify Function: public message reads + password-protected admin actions.
const json = (data, statusCode = 200) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(data)
});

export default async (request) => {
  const googleUrl = process.env.GOOGLE_SCRIPT_URL;
  const apiSecret = process.env.GOOGLE_API_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!googleUrl || !apiSecret || !adminPassword) {
    return json({ success: false, error: "Netlify-Umgebungsvariablen fehlen." }, 500);
  }

  if (request.method === "GET") {
    try {
      const upstream = await fetch(googleUrl, { method: "GET", redirect: "follow" });
      const data = await upstream.json();
      return json(data, upstream.ok ? 200 : 502);
    } catch {
      return json({ success: false, error: "Google-Dienst ist nicht erreichbar." }, 502);
    }
  }

  if (request.method !== "POST") {
    return json({ success: false, error: "Methode nicht erlaubt." }, 405);
  }

  const suppliedPassword = request.headers.get("x-admin-password") || "";
  if (suppliedPassword !== adminPassword) {
    return json({ success: false, error: "Unauthorized: Passwort falsch." }, 401);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ success: false, error: "Ungültige Anfrage." }, 400);
  }

  const allowed = new Set(["list", "add", "update", "delete"]);
  if (!allowed.has(data.action)) {
    return json({ success: false, error: "Unbekannte Aktion." }, 400);
  }

  try {
    const upstream = await fetch(googleUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...data, secret: apiSecret })
    });
    const result = await upstream.json();
    return json(result, upstream.ok ? 200 : 502);
  } catch {
    return json({ success: false, error: "Google-Dienst ist nicht erreichbar." }, 502);
  }
};
