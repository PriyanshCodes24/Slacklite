import { useEffect } from "react";

export const useChatShortcuts = ({
  handleShortcut,
  inputRef,
  previewImage,
  navigate,
  setPreviewImage,
}) => {
  useEffect(() => {
    const handleShortcut = (e) => {
      const isTyping =
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement?.isContentEditable;

      if (e.key === "Escape") {
        if (isTyping) {
          inputRef.current?.blur();
          return;
        }
        if (previewImage) {
          setPreviewImage(null);
          return;
        }
        navigate("/");
      }

      if (e.key === "/") {
        if (isTyping) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [navigate, previewImage]);
};
