const button = document.getElementById("messageButton");
const output = document.getElementById("message");

let messages = [];
let previousIndex = -1;

async function loadMessages() {
  output.textContent = "";
  try {
    const response = await fetch("/.netlify/functions/api");
    const data = await response.json();
    if (!response.ok || !data.success || !Array.isArray(data.messages)) {
      throw new Error(data.error || "Nachrichten konnten nicht geladen werden.");
    }
    messages = data.messages.filter(item => item && typeof item.text === "string" && item.text.trim());
  } catch (error) {
    output.textContent = "Die Nachrichten konnten gerade nicht geladen werden.";
    console.error(error);
  }
}

button.addEventListener("click", async () => {
  if (!messages.length) await loadMessages();
  if (!messages.length) return;

  let index = Math.floor(Math.random() * messages.length);
  // Avoid an immediate repeat when there is more than one message.
  if (messages.length > 1 && index === previousIndex) {
    index = (index + 1 + Math.floor(Math.random() * (messages.length - 1))) % messages.length;
  }
  previousIndex = index;
  output.textContent = messages[index].text;
});

loadMessages();
