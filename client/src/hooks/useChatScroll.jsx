import { useEffect, useRef, useState } from "react";

export const useChatScroll = (chat) => {
  const bottomRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const threshold = 100;

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      setShowScrollButton(!isNearBottom);
    };
    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return { chatContainerRef, showScrollButton, bottomRef, scrollToBottom };
};
