import React, { useState, useEffect, useContext, useRef } from "react";
import { SocketContext, UserContext } from "../Context";

const ChatBox = ({ roomName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const { socket } = useContext(SocketContext);
  const myUsername = useContext(UserContext).username;
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([]);

    socket.on("chatMessage", (msgData) => {
      const { sender, msg } = msgData;
      if (roomName != msgData.roomName) return;
      const newMessage = { sender, msg };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [roomName]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const msgData = { msg: inputMessage, roomName };
      console.log(`Emiting`);
      console.log(msgData);
      socket.emit("sendChatMessage", msgData);
      setInputMessage("");
    }
  };

  return (
    <div className="parent-container h-full flex flex-col">
      <div
        ref={chatBoxRef}
        className="chat-box bg-gray-700 rounded-t-md flex-1 overflow-y-auto pb-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === myUsername
                ? "my-message rounded-lg p-2 text-sm"
                : "other-message rounded-lg p-2 text-sm"
            }
          >
            {message.sender === myUsername && (
              <span className="font-bold text-green-600">
                {message.sender}:{" "}
              </span>
            )}
            {message.sender !== myUsername && (
              <span className="font-bold">{message.sender}: </span>
            )}
            <span className="text-white">{message.msg}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={inputMessage}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="bg-white border border-gray-300 p-2 text-sm "
      />
    </div>
  );
};

export default ChatBox;
