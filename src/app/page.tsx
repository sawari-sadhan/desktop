"use client";

/* Exact replica of github/esona/web/app/components/chat/chat.tsx JSX structure */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import FormattedText from "@/app/components/FormattedText";
import AgentV1 from "$v1/agent-weaver";

/* Exact SendIcon SVG from github/esona/web/app/components/icons/icons.tsx */
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M22 2L11 13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser?: boolean;
}

function renderUserMessageText(text: string) {
  return <span className="whitespace-pre-wrap">{text}</span>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* Seed opening message — same pattern as Esona */
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: "welcome-how-was-your-day",
          text: "How can I assist you with vehicle-related information in Nepal today?",
          timestamp: new Date(),
          isUser: false,
        },
      ];
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* Auto-resize textarea — exact same logic as Esona */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const response = await AgentV1.director.message(messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response.reply || "I processed your request, but the engine returned an empty response.",
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    /* Exact outer wrapper from github/esona/web/app/page.tsx */
    <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 bg-[#121218] overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl mx-auto h-full flex flex-col py-4 sm:py-5 md:py-6">

        {/* === CHAT COMPONENT — exact JSX from chat.tsx === */}
        <div className={`w-full flex flex-col ${messages.length > 0 ? "h-full" : "justify-center h-full"}`}>

          {/* Messages area */}
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-6 md:py-7 space-y-4 sm:space-y-4 md:space-y-5 mb-4 sm:mb-5 md:mb-6 min-h-0 scrollbar-hide"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative rounded-xl px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 md:py-4.5 backdrop-blur-md border border-white/20 ${
                      message.isUser
                        ? "max-w-[88%] sm:max-w-[70%] md:max-w-[65%] lg:max-w-[60%] bg-gradient-to-br from-white/20 to-white/10 text-white/80 shadow-xl shadow-cyan-500/10"
                        : "max-w-[90%] bg-gradient-to-br from-white/10 to-white/5 text-gray-100 shadow-xl shadow-blue-500/10"
                    }`}
                  >
                    <div
                      className={`text-xs sm:text-sm md:text-base lg:text-[15px] break-words leading-relaxed sm:leading-relaxed tracking-wide ${
                        message.isUser ? "text-white/80 font-normal" : "font-light text-gray-100"
                      }`}
                    >
                      {message.isUser ? (
                        renderUserMessageText(message.text)
                      ) : (
                        <FormattedText text={message.text} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator — exact from chat.tsx lines 701–731 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 md:py-4.5 backdrop-blur-md shadow-xl shadow-blue-500/10 max-w-[90%]">
                    <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
                      <div className="flex gap-1.5 sm:gap-2">
                        <motion.div
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400/90 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-400/90 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.div
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400/90 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                        />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-[15px] font-light tracking-wide">
                        Processing...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}

          {/* Input area — exact from chat.tsx lines 864–958 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex gap-3 sm:gap-3.5 md:gap-4 items-center backdrop-blur-xl bg-gradient-to-br from-white/8 to-white/4 border border-white/25 rounded-xl px-4 sm:px-5 md:px-6 lg:px-7 py-3.5 sm:py-4 md:py-4.5 shadow-2xl overflow-hidden"
          >
            {/* Subtle animated glow sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/8 to-cyan-500/0"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative flex-1 z-10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How was your day?"
                rows={1}
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 text-xs sm:text-sm md:text-base lg:text-[15px] focus:placeholder-gray-300 transition-all duration-200 leading-relaxed font-medium resize-none overflow-hidden min-h-[1.5rem] max-h-[200px]"
                disabled={isLoading}
                style={{ height: "auto" }}
              />
            </div>
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-white to-gray-100 text-black rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:from-gray-50 hover:to-white active:from-gray-100 active:to-gray-50 transition-all duration-200 shadow-xl shadow-white/20 flex-shrink-0"
              aria-label="Send message"
            >
              <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
