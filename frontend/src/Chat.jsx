import "./Chat.css";
import { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "./MyContext";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function Chat() {

  const { prevChats, setPrevChats } = useContext(MyContext);

  const [typedContent, setTypedContent] = useState("");

  const chatEndRef = useRef(null);

  const prevLengthRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved && prevChats.length === 0) {
      setPrevChats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(prevChats));
  }, [prevChats]);

  useEffect(() => {

    const lastChat = prevChats?.[prevChats.length - 1];

    if (
      prevChats.length <= prevLengthRef.current ||
      !lastChat ||
      lastChat.role !== "assistant"
    ) {
      prevLengthRef.current = prevChats.length;
      return;
    }

    prevLengthRef.current = prevChats.length;

    setTypedContent("");

    let index = 0;

    const interval = setInterval(() => {

      if (!lastChat.content || index >= lastChat.content.length) {
        clearInterval(interval);
        return;
      }

      index++;
      setTypedContent(lastChat.content.slice(0, index));

    }, 15);

    return () => clearInterval(interval);

  }, [prevChats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats, typedContent]);

  return (
    <div className="chatPage">

      {prevChats.length === 0 ? (

        <div className="emptyState">
          <h1>Start a New Chat!</h1>
        </div>

      ) : (

        <div className="chats">

          {prevChats.map((chat, idx) => {

            const isLastAssistant =
              idx === prevChats.length - 1 &&
              chat.role === "assistant";

            return (
              <div
                key={idx}
                className={chat.role === "user" ? "userDiv" : "gptDiv"}
              >

                {chat.role === "user" ? (

                  <p className="userMessage">
                    {chat.content}
                  </p>

                ) : (

                  <div className="gptMessage">

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children }) {

                          const match = /language-(\w+)/.exec(className || "");

                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="inlineCode">
                              {children}
                            </code>
                          );

                        }
                      }}
                    >
                      {isLastAssistant ? typedContent : chat.content}
                    </ReactMarkdown>

                  </div>

                )}

              </div>
            );

          })}

          <div ref={chatEndRef} />

        </div>

      )}

    </div>
  );
}

export default Chat;