const chatContainer = document.getElementById("chat-container");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const clearBtn = document.getElementById("clear-chat-btn");
const exportBtn = document.getElementById("export-pdf-btn");
const shareBtn = document.getElementById("share-btn");
const toast = document.getElementById("toast");
const modelSelector = document.getElementById("model-selector");
const personalitySelector = document.getElementById("personality-selector");
const imageUpload = document.getElementById("image-upload");

let messages = JSON.parse(localStorage.getItem("chat")) || [];

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2000);
}

function appendMessage(role, text, imageURL) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `<div>${text}</div>`;
  if (imageURL) {
    const img = document.createElement("img");
    img.src = imageURL;
    img.className = "uploaded-image";
    msg.appendChild(img);
  }
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveMessages() {
  localStorage.setItem("chat", JSON.stringify(messages));
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage("user", userText);
  messages.push({ role: "user", content: userText });
  input.value = "";
  saveMessages();

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message bot typing";
  loadingMsg.textContent = "Claude is typing...";
  chatContainer.appendChild(loadingMsg);

  const res = await fetch("https://your-hf-backend-url.hf.space/chat", {
    method: "POST",
    body: JSON.stringify({
      prompt: userText,
      model: modelSelector.value,
      personality: personalitySelector.value
    }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await res.json();
  chatContainer.removeChild(loadingMsg);
  appendMessage("bot", data.reply);
  messages.push({ role: "bot", content: data.reply });
  saveMessages();
  speak(data.reply);
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

clearBtn.onclick = () => {
  localStorage.removeItem("chat");
  chatContainer.innerHTML = "";
  showToast("Chat cleared!");
};

voiceBtn.onclick = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = e => {
    input.value = e.results[0][0].transcript;
    sendMessage();
  };
};

exportBtn.onclick = () => {
  const win = window.open("", "", "width=600,height=400");
  win.document.write("<h1>Chat History</h1>");
  messages.forEach(msg => win.document.write(`<p><strong>${msg.role}:</strong> ${msg.content}</p>`));
  win.print();
};

shareBtn.onclick = () => {
  const shareLink = window.location.href + "?chat=" + encodeURIComponent(JSON.stringify(messages));
  navigator.clipboard.writeText(shareLink).then(() => showToast("Share link copied!"));
};

imageUpload.onchange = () => {
  const file = imageUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      appendMessage("user", "(Image uploaded)", reader.result);
      messages.push({ role: "user", content: "(image)", image: reader.result });
      saveMessages();
    };
    reader.readAsDataURL(file);
  }
};

window.onload = () => {
  messages.forEach(m => appendMessage(m.role, m.content, m.image));
};
