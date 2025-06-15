// Mapping for speech recognition and speech synthesis language codes
const langMap = {
  en: "en-US",
  hi: "hi-IN",
  te: "te-IN",
  ur: "ur-IN",
  pa: "pa-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  gu: "gu-IN",
  ml: "ml-IN"
};

// Function to send the query to the backend and display the matched schemes
function sendQuery() {
  const query = document.getElementById("query").value;

  fetch("/get_schemes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query })
  })
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById("results");
      const selectedLang = document.getElementById("language").value;
      const ttsLang = langMap[selectedLang] || "en-US";

      if (data.length === 0) {
        resultDiv.innerHTML = "<p>🚫 No matching schemes found.</p>";
      } else {
        resultDiv.innerHTML = "";
        data.forEach((scheme, index) => {
          const textToSpeak = `Scheme: ${scheme.name}. Eligibility: ${scheme.eligibility}. How to apply: ${scheme.how_to_apply}`;
          const pauseBtnId = `pauseBtn${index}`;
          resultDiv.innerHTML += `
            <div>
              <h3>${scheme.name}</h3>
              <p><strong>Eligibility:</strong> ${scheme.eligibility}</p>
              <p><strong>Documents:</strong> ${scheme.documents}</p>
              <p><strong>How to Apply:</strong> ${scheme.how_to_apply}</p>
              <a href="${scheme.link}" target="_blank">Apply Here</a>
              <br><br>
              <button style="font-size: 0.9em; padding: 5px 10px;" onclick="speakText(\`${textToSpeak}\`, '${ttsLang}', '${pauseBtnId}')">🔊 Speak</button>
              <button id="${pauseBtnId}" style="font-size: 0.9em; padding: 5px 10px;" onclick="togglePauseResume(this)">⏸️ Pause</button>
            </div>
          `;
        });
      }
    })
    .catch(error => {
      console.error("Error fetching schemes:", error);
      document.getElementById("results").innerHTML = "<p>⚠️ Error processing your request.</p>";
    });
}

// Function to start voice input using Web Speech API
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  const selectedLang = document.getElementById("language").value;
  recognition.lang = langMap[selectedLang] || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = function () {
    console.log("🎙️ Listening for voice input...");
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("Voice input error: " + event.error);
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("query").value = transcript;
    console.log("✅ Recognized voice input:", transcript);
  };

  recognition.start();
}

// Function to read text aloud (Text-to-Speech)
function speakText(text, langCode = "en-US", pauseBtnId = null) {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    speechSynthesis.speak(utterance);

    // Reset pause button label if provided
    if (pauseBtnId) {
      const btn = document.getElementById(pauseBtnId);
      if (btn) btn.innerText = "⏸️ Pause";
    }
  } else {
    alert("Text-to-speech is not supported in your browser.");
  }
}

// Toggle pause/resume on the same button
function togglePauseResume(button) {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    button.innerText = "▶️ Resume";
  } else if (speechSynthesis.paused) {
    speechSynthesis.resume();
    button.innerText = "⏸️ Pause";
  }
}