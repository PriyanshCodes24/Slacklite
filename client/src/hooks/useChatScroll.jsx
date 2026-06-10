import { useEffect, useRef, useState } from "react";

export const useChatScroll = (chat) => {
  const bottomRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const previousLengthRef = useRef(chat.length);

  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const messageAdded = chat.length > previousLengthRef.current;

    if (messageAdded) {
      if (isNearBottomRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

        setNewMessageCount(0);
      } else {
        setNewMessageCount((prev) => prev + 1);
      }
    }
    previousLengthRef.current = chat.length;
  }, [chat]);

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      isNearBottomRef.current = isNearBottom;

      setShowScrollButton(!isNearBottom);

      if (isNearBottom) {
        setNewMessageCount(0);
      }
    };
    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    setNewMessageCount(0);
  };
  return {
    chatContainerRef,
    showScrollButton,
    bottomRef,
    scrollToBottom,
    newMessageCount,
  };
};
