import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";
import logo from "./assets/convoai-logo.png";

function Sidebar({ closeSidebar }) {   

  const {
    allThreads,
    setAllThreads,
    setcurrthreadid,
    setPrevChats,
    setNewChat,
    setIsTyping   
  } = useContext(MyContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  const fetchThreads = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/thread`, {
        headers: getHeaders()
      });

      if (res.status === 401) {
        showToast("Session expired. Please login again");
        return;
      }

      const data = await res.json();
      setAllThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setAllThreads([]);
      showToast("Failed to load threads");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchThreads();
  }, []);

  const loadThread = async (threadid) => {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login first");
      return;
    }

    try {
      const res = await fetch(`${API}/api/thread/${threadid}`, {
        headers: getHeaders()
      });

      if (res.status === 401) {
        showToast("Unauthorized");
        return;
      }

      const data = await res.json();

      setcurrthreadid(threadid);
      setPrevChats(data);
      setNewChat(false);
      setIsTyping(false);

      if (closeSidebar) closeSidebar();

    } catch (err) {
      console.log(err);
      showToast("Failed to load chat");
    }
  };

  const handleNewChat = () => {
    setPrevChats([]);
    setcurrthreadid(uuidv1());
    setNewChat(true);
    setIsTyping(false);

    if (closeSidebar) closeSidebar();
  };

  const deleteThread = async (threadid) => {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login first");
      return;
    }

    try {
      await fetch(`${API}/api/thread/${threadid}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      fetchThreads();
      showToast("Chat deleted");

    } catch (err) {
      console.log(err);
      showToast("Delete failed");
    }
  };

  const renameThread = async (threadid, oldTitle) => {
    const newTitle = prompt("Rename chat", oldTitle);
    if (!newTitle) return;

    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login first");
      return;
    }

    try {
      await fetch(`${API}/api/thread/${threadid}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ title: newTitle })
      });

      fetchThreads();
      showToast("Chat renamed");

    } catch (err) {
      console.log(err);
      showToast("Rename failed");
    }
  };

  const shareThread = async (threadid) => {
    const shareLink = `${FRONTEND_URL}/share/${threadid}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "ConvoAI Chat",
          text: "Check out this conversation",
          url: shareLink,
        });
        showToast("Shared successfully");
      } else {
        await navigator.clipboard.writeText(shareLink);
        showToast("Link copied");
      }
    } catch (err) {
      console.log(err);
      showToast("Sharing failed");
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login first");
      return;
    }

    try {
      const res = await fetch(`${API}/api/search/${query}`, {
        headers: getHeaders()
      });

      if (res.status === 401) {
        showToast("Unauthorized");
        return;
      }

      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);

    } catch (err) {
      console.log(err);
      showToast("Search failed");
    }
  };

  return (
    <section className="sidebar">

      {toast && <div className="toast">{toast}</div>}

      <button className="newChatBtn" onClick={handleNewChat}>
        <img src={logo} alt="CONVOAI Logo" className="logo" />
        <span className="icon">
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <input
        type="text"
        placeholder="Search chats..."
        className="searchBar"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {searchResults.length > 0 && (
        <div className="searchResults">
          {searchResults.map((item, index) => (
            <div
              key={index}
              className="searchResult"
              onClick={() => loadThread(item.threadid)}
            >
              {item.message.slice(0, 60)}...
            </div>
          ))}
        </div>
      )}

      <div className="threads">
        {(allThreads || []).map((thread) => (
          <div key={thread.threadid} className="threadRow">

            <div
              className="thread"
              onClick={() => loadThread(thread.threadid)}
            >
              {thread.title}
            </div>

            <div className="threadActions">

              <i
                className="fa-solid fa-pen"
                onClick={(e) => {
                  e.stopPropagation();
                  renameThread(thread.threadid, thread.title);
                }}
              ></i>

              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadid);
                }}
              ></i>

              <i
                className="fa-solid fa-share"
                onClick={(e) => {
                  e.stopPropagation();
                  shareThread(thread.threadid);
                }}
              ></i>

            </div>

          </div>
        ))}
      </div>

      <div className="sign">
        <p>made by spoorthi 💕</p>
      </div>

    </section>
  );
}

export default Sidebar;