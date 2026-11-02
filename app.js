// MAX: English interface + Telugu speech. No API key is used.
const listenButton = document.getElementById("listenButton");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const responseEl = document.getElementById("response");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

function setStatus(message) {
  statusEl.textContent = message; // Interface text stays English.
}

function speakTelugu(message) {
  if (!("speechSynthesis" in window)) {
    responseEl.textContent = message;
    setStatus("Speech output is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  responseEl.textContent = message;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "te-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const teluguVoice = voices.find(v =>
    v.lang && v.lang.toLowerCase().startsWith("te")
  );
  if (teluguVoice) utterance.voice = teluguVoice;

  window.speechSynthesis.speak(utterance);
}

function normalize(text) {
  return text.toLowerCase().replace(/[.,!?।]/g, "").trim();
}

function handleCommand(rawCommand) {
  const command = normalize(rawCommand);
  transcriptEl.textContent = rawCommand;
  setStatus("Command received");

  // Greetings
  if (command.includes("హలో") || command.includes("నమస్కారం")) {
    speakTelugu("నమస్కారం! నేను మ్యాక్స్. మీకు ఎలా సహాయం చేయాలి?");
    return;
  }

  // Identity
  if (command.includes("నీ పేరు") || command.includes("నీ పేరేంటి")) {
    speakTelugu("నా పేరు మ్యాక్స్.");
    return;
  }

  // Time
  if (command.includes("సమయం") || command.includes("టైం")) {
    const time = new Intl.DateTimeFormat("te-IN", {
      hour: "numeric", minute: "2-digit"
    }).format(new Date());
    speakTelugu("ప్రస్తుత సమయం " + time);
    return;
  }

  // Date
  if (command.includes("తేదీ") || command.includes("ఈరోజు")) {
    const date = new Intl.DateTimeFormat("te-IN", {
      day: "numeric", month: "long", year: "numeric"
    }).format(new Date());
    speakTelugu("ఈరోజు తేదీ " + date);
    return;
  }

  // Open websites (browser action, not native app control)
  if (command.includes("గూగుల్")) {
    speakTelugu("గూగుల్ వెబ్‌సైట్ తెరుస్తున్నాను.");
    window.open("https://www.google.com", "_blank", "noopener");
    return;
  }

  if (command.includes("యూట్యూబ్")) {
    speakTelugu("యూట్యూబ్ వెబ్‌సైట్ తెరుస్తున్నాను.");
    window.open("https://www.youtube.com", "_blank", "noopener");
    return;
  }

  if (command.includes("ఆపు") || command.includes("నిశ్శబ్దం")) {
    window.speechSynthesis.cancel();
    responseEl.textContent = "Speech stopped.";
    setStatus("Ready");
    return;
  }

  if (command.includes("సహాయం") || command.includes("ఏమి చేయగలవు")) {
    speakTelugu("నేను సమయం, తేదీ చెప్పగలను. గూగుల్ మరియు యూట్యూబ్ వెబ్‌సైట్లను తెరవగలను.");
    return;
  }

  speakTelugu("క్షమించండి. ఈ ఆదేశం ఇంకా అందుబాటులో లేదు.");
}

function startListening() {
  if (!SpeechRecognition) {
    setStatus("Speech recognition is unavailable. Try a supported browser.");
    speakTelugu("ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు.");
    return;
  }

  if (isListening) return;

  recognition = new SpeechRecognition();
  recognition.lang = "te-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    listenButton.classList.add("listening");
    listenButton.querySelector(".listen-label").textContent = "LISTENING...";
    setStatus("Listening for Telugu speech...");
  };

  recognition.onresult = event => {
    const spokenText = event.results[0][0].transcript;
    handleCommand(spokenText);
  };

  recognition.onerror = event => {
    const messages = {
      "not-allowed": "Microphone permission denied",
      "no-speech": "No speech detected. Try again.",
      "network": "Speech service network error"
    };
    setStatus(messages[event.error] || "Speech recognition error: " + event.error);
  };

  recognition.onend = () => {
    isListening = false;
    listenButton.classList.remove("listening");
    listenButton.querySelector(".listen-label").textContent = "TAP TO SPEAK";
    if (statusEl.textContent.startsWith("Listening")) setStatus("Ready when you are");
  };

  try {
    recognition.start();
  } catch (error) {
    setStatus("Could not start microphone. Please tap again.");
  }
}

listenButton.addEventListener("click", startListening);

// Example buttons fill in the recognized-command area and test command handling.
document.querySelectorAll("[data-command]").forEach(button => {
  button.addEventListener("click", () => handleCommand(button.dataset.command));
});

// Load voices where the browser exposes them.
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
