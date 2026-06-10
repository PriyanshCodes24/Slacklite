import { useEffect } from "react";

export const useChatShortcuts = ({
  inputRef,
  previewImage,
  navigate,
  setPreviewImage,
  editingMessageId,
  setEditingMessageId,
  setEditedText,
}) => {
  useEffect(() => {
    const handleShortcut = (e) => {
      const isTyping =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.isContentEditable;

      if (e.key === "Escape") {
        if (previewImage) {
          setPreviewImage(null);
          return;
        }
        if (editingMessageId) {
          setEditingMessageId(null);
          setEditedText("");
          return;
        }
        if (isTyping) {
          inputRef.current?.blur();
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
  }, [
    navigate,
    previewImage,
    editingMessageId,
    inputRef,
    setPreviewImage,
    setEditingMessageId,
    setEditedText,
  ]);
};
