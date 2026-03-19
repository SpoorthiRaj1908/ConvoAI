import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./SharePage.css";

function SharePage() {
  const { threadid } = useParams();

  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch(`${API}/api/share/${threadid}`);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        setTitle(data.title || "");
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        console.log(err);
        setError("Unable to load shared chat");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [threadid, API]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return <div className="center-screen">Loading conversation...</div>;
  }

  if (error) {
    return <div className="center-screen">{error}</div>;
  }

  return (
    <div className="share-page">

      <div className="share-title">
        💬 {title || "Shared Conversation"}
        <div className="share-sub">Shared via ConvoAI</div>
      </div>

      <div className="chat-container">
        <div className="chat-box">

          {messages.length === 0 ? (
            <p>No messages found</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-row ${
                  msg.role === "user" ? "user-row" : "ai-row"
                }`}
              >
                <div
                  className={
                    msg.role === "user" ? "user-bubble" : "ai-bubble"
                  }
                >
                  <div className="role">
                    {msg.role === "user" ? "You" : "AI"}
                  </div>

                  <div className="content">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  <button
                    className="copy-btn"
                    onClick={() => copyMessage(msg.content)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))
          )}

          <div ref={chatEndRef}></div>
        </div>
      </div>
    </div>
  );
}

export default SharePage;