import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useRef } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {

  const {
    prompt,
    setPrompt,
    currthreadid,
    setcurrthreadid,
    prevChats,
    setPrevChats
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState("");

  const recognitionRef = useRef(null);

  // ✅ API from env
  const API = import.meta.env.VITE_API_URL;

  const showFlash = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    showFlash("Logged out successfully");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showFlash("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    recognitionRef.current = recognition;
    setRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setVoiceMode(true);
    };

    recognition.onerror = () => {
      setRecording(false);
      showFlash("Voice recognition error");
    };
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);

      setTimeout(() => {
        getReply();
      }, 300);
    }
  };

  const toggleMic = () => {
    recording ? stopListening() : startListening();
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";

    window.speechSynthesis.speak(speech);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`${API}/upload`, {   // ✅ FIXED
        method: "POST",
        body: formData
      });

      showFlash("File uploaded");

    } catch {
      showFlash("Upload failed");
    }
  };

  const getReply = async () => {

    if (!prompt.trim() || loading) return;

    const messageToSend = prompt.trim();

    const updatedChats = [
      ...prevChats,
      { role: "user", content: messageToSend }
    ];

    setPrevChats(updatedChats);

    setPrompt("");
    setLoading(true);
    setUploadedFile(null);

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        showFlash("User not logged in");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/api/chat`, {   // ✅ FIXED
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: updatedChats,
          threadid: currthreadid
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        showFlash("User not registered");
        return;
      }

      if (!res.ok) {
        showFlash(data.error || "Something went wrong");
        return;
      }

      setPrevChats(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);

      if (voiceMode) {
        speak(data.reply);
        setVoiceMode(false);
      }

      if (!currthreadid && data.threadid) {
        setcurrthreadid(data.threadid);
      }

    } catch {
      showFlash("Server connection failed");
    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="ChatWindow">

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      <div className="navbar">

        <span>
          CONVOAI <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div className="usericondiv">

          <span
            className="usericon"
            onClick={() => setShowMenu(!showMenu)}
          >
            <i className="fa-solid fa-user"></i>
          </span>

          {showMenu && (

            <div className="userMenu">

              {localStorage.getItem("token") ? (
                <p onClick={handleLogout}>Logout</p>
              ) : (
                <p>Login</p>
              )}

            </div>

          )}

        </div>

      </div>

      <Chat />

      <div className="loaderContainer">
        <ScaleLoader color="#fff" loading={loading} />
      </div>

      <div className="chatinpt">

        {uploadedFile && (
          <div className="filePreview">
            📄 {uploadedFile}
          </div>
        )}

        <div className="userinpt">

          <label className="uploadIcon">
            <i className="fa-solid fa-paperclip"></i>
            <input type="file" hidden onChange={handleFileUpload} />
          </label>

          <div className="micBtn" onClick={toggleMic}>
            <i className={`fa-solid ${recording ? "fa-stop" : "fa-microphone"}`}></i>
          </div>

          <input
            type="text"
            placeholder="Ask anything!"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") getReply();
            }}
            disabled={loading}
          />

          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>

        </div>

        <p className="info">
          {loading ? "Thinking..." : "CONVOAI can make mistakes!"}
        </p>

      </div>

    </div>

  );

}

export default ChatWindow;