export const formatLastSeen = (date) => {
  if (!date) return "Offline";

  const diff = Date.now() - new Date(date);

  console.log(diff);
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 2) return "Yesterday";

  return `${days}d ago`;
};
