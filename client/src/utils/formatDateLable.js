export const formatDateLable = (date) => {
  const msgDate = new Date(date);

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isToday = msgDate.toDateString() === today.toDateString();
  const isYesterday = msgDate.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return msgDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: msgDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};
