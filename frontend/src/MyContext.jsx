import { createContext, useState } from "react";

export const MyContext = createContext();

export const MyProvider = ({ children }) => {

  const [newChat, setNewChat] = useState(true);
  const [prevChats, setPrevChats] = useState([]);
  const [input, setInput] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const sendMessage = async () => {
    if (!input.trim()) return;

    setNewChat(false);

    const updatedChats = [
      ...prevChats,
      { role: "user", content: input }
    ];

    setPrevChats(updatedChats);
    setInput("");

    try {

      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/api/chat`, {   
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedChats })
      });

      const data = await response.json();

      setPrevChats(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);

    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <MyContext.Provider
      value={{
        newChat,
        prevChats,
        input,
        setInput,
        sendMessage
      }}
    >
      {children}
    </MyContext.Provider>
  );
};