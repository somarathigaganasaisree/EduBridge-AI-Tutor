import { useState } from "react";
import { api } from "../api/client";
import "./ChatbotWidget.css";


function ChatbotWidget({ grade }) {

  const [isOpen, setIsOpen] =
    useState(false);

  const [isMaximized, setIsMaximized] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);


  // Convert grade into RAG format.
  //
  // 8       -> class8
  // "8"     -> class8
  // "class8" -> class8
  // "Class 8" -> class8

  const rawGrade = grade
    ? String(grade)
        .toLowerCase()
        .replace(/\s+/g, "")
    : "";

  const className = rawGrade
    ? rawGrade.startsWith("class")
      ? rawGrade
      : `class${rawGrade}`
    : "";


  const [messages, setMessages] =
    useState([
      {
        sender: "bot",
        text:
          "Hi! I'm your AI Doubt Solver. Ask me anything about your study material.",
      },
    ]);


  const sendMessage = async () => {

    const userText =
      message.trim();

    if (!userText || isSending) {
      return;
    }


    const userMessage = {
      sender: "user",
      text: userText,
    };


    // Show user message immediately
    setMessages(
      (previousMessages) => [
        ...previousMessages,
        userMessage,
      ]
    );


    setMessage("");
    setIsSending(true);


    try {

      const response =
        await api.ask(
          userText,
          {
            className,
            subject: "",
          }
        );


      const botAnswer =
        response?.answer ||
        "Sorry, I couldn't generate an answer right now.";


      setMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            sender: "bot",
            text: botAnswer,
          },
        ]
      );


    } catch (error) {

      console.error(
        "AI Tutor Error:",
        error
      );


      setMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            sender: "bot",
            text:
              error?.message ||
              "Unable to reach the AI Tutor. Please make sure the backend is running.",
          },
        ]
      );


    } finally {

      setIsSending(false);

    }
  };


  return (
    <>

      {/* Floating button */}

      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Open AI Tutor"
          title="Open AI Doubt Solver"
        >
          💬
        </button>
      )}


      {/* Chat window */}

      {isOpen && (

        <div
          className={`chatbot-window ${
            isMaximized
              ? "maximized"
              : ""
          }`}
        >

          {/* Header */}

          <div className="chatbot-header">

            <div>

              <h3>
                AI Doubt Solver
              </h3>

              <span>
                Ask your study doubts
              </span>

            </div>


            <div className="chatbot-header-actions">

              <button
                className="chatbot-maximize"
                onClick={() =>
                  setIsMaximized(
                    (previous) =>
                      !previous
                  )
                }
                title={
                  isMaximized
                    ? "Restore size"
                    : "Maximize window"
                }
              >
                {isMaximized
                  ? "🗗"
                  : "⛶"}
              </button>


              <button
                className="chatbot-close"
                onClick={() => {
                  setIsOpen(false);
                  setIsMaximized(false);
                }}
                title="Close"
              >
                ×
              </button>

            </div>

          </div>


          {/* Messages */}

          <div className="chatbot-messages">

            {messages.map(
              (msg, index) => (

                <div
                  key={index}
                  className={`chat-message ${msg.sender}`}
                >
                  {msg.text}
                </div>

              )
            )}


            {isSending && (

              <div className="chat-message bot">
                Thinking... 🤔
              </div>

            )}

          </div>


          {/* Input */}

          <div className="chatbot-input-area">

            <input
              type="text"
              placeholder="Ask a question..."
              value={message}
              disabled={isSending}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {
                  sendMessage();
                }

              }}
            />


            <button
              onClick={sendMessage}
              disabled={
                isSending ||
                !message.trim()
              }
              title="Send"
            >
              ➤
            </button>

          </div>

        </div>

      )}

    </>
  );
}


export default ChatbotWidget;