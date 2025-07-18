const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const toggleBtn = document.getElementById("toggleTheme");

let history = [];

const BACKEND_URL = "https://rahulchauhan33-design-executive-backend.hf.space"; // ✅ replace with your backend URL

toggleBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

sendBtn.onclick = async () => {
  const input = userInput.value.trim();
  if (!input) return;

  addMessage(input, "user");
  userInput.value = "";

  const response = await fetch(`${BACKEND_URL}/run/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [input, history]
    })
  });

  const result = await response.json();
  const reply = result.data[0];
  history = result.data[1];
  addMessage(reply, "bot");
};

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
