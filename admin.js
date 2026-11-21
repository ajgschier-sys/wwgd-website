const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginStatus = document.getElementById("loginStatus");
const adminStatus = document.getElementById("adminStatus");
const list = document.getElementById("messageList");
const addForm = document.getElementById("addForm");
let adminPassword = "";

async function api(action, payload = {}) {
  const response = await fetch("/.netlify/functions/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Password": adminPassword
    },
    body: JSON.stringify({ action, ...payload })
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Anfrage fehlgeschlagen.");
  return data;
}

async function loadAdminMessages() {
  adminStatus.textContent = "Lade Nachrichten …";
  try {
    const data = await api("list");
    renderMessages(data.messages || []);
    adminStatus.textContent = `${(data.messages || []).length} Nachricht(en) geladen.`;
  } catch (error) {
    adminStatus.textContent = error.message;
    if (/unauthorized|passwort/i.test(error.message)) logout();
  }
}

function renderMessages(messages) {
  list.replaceChildren();
  for (const message of messages) {
    const li = document.createElement("li");
    li.className = "message-item";

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 500;
    input.value = message.text;
    input.setAttribute("aria-label", "Nachricht bearbeiten");

    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Speichern";
    save.addEventListener("click", async () => {
      try {
        await api("update", { id: message.id, text: input.value });
        adminStatus.textContent = "Nachricht gespeichert.";
        await loadAdminMessages();
      } catch (error) { adminStatus.textContent = error.message; }
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "secondary";
    remove.textContent = "Löschen";
    remove.addEventListener("click", async () => {
      if (!confirm("Diese Nachricht wirklich löschen?")) return;
      try {
        await api("delete", { id: message.id });
        adminStatus.textContent = "Nachricht gelöscht.";
        await loadAdminMessages();
      } catch (error) { adminStatus.textContent = error.message; }
    });

    li.append(input, save, remove);
    list.append(li);
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminPassword = passwordInput.value;
  try {
    await api("list");
    loginPanel.hidden = true;
    adminPanel.hidden = false;
    passwordInput.value = "";
    await loadAdminMessages();
  } catch (error) {
    adminPassword = "";
    loginStatus.textContent = "Anmeldung fehlgeschlagen. Bitte Passwort prüfen.";
  }
});

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.getElementById("newText");
  try {
    await api("add", { text: input.value });
    input.value = "";
    adminStatus.textContent = "Nachricht hinzugefügt.";
    await loadAdminMessages();
  } catch (error) { adminStatus.textContent = error.message; }
});

document.getElementById("logoutButton").addEventListener("click", logout);

function logout() {
  adminPassword = "";
  adminPanel.hidden = true;
  loginPanel.hidden = false;
  list.replaceChildren();
  loginStatus.textContent = "Du bist abgemeldet.";
}
