import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./SharePage.css";

function SharePage() {
  const { threadid } = useParams();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchChat = async () => {
      try {
        // ✅ FIXED: using public share route
        const res = await fetch(`${API}/api/share/${threadid}`);

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();

        // ✅ backend returns messages array
        setMessages(Array.isArray(data) ? data : []);

      } catch (err) {
        console.log(err);
        setError("Unable to load shared chat");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [threadid, API]);

  // ✅ auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="center-screen">
        <p>Loading conversation...</p>
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="center-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="share-container">

      <h2 className="share-header">Shared Conversation</h2>

      <div className="share-chatbox">
        {messages.length === 0 ? (
          <p>No messages found</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={msg.role === "user" ? "user-msg" : "ai-msg"}
            >
              <div className="msg-role">
                {msg.role === "user" ? "You" : "AI"}
              </div>
              <div>{msg.content}</div>
            </div>
          ))
        )}

        <div ref={chatEndRef}></div>
      </div>

    </div>
  );
}

export default SharePage;