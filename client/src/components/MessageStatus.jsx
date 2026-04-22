const SingleTick = () => (
  <svg width="14" height="12" viewBox="0 0 16 12" fill="none">
    <path
      d="M3 7l3 3 7-7"
      stroke="#9ca3af"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DoubleTick = ({ seen }) => (
  <div className="flex -space-x-1">
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      className="inline-block"
    >
      <path
        d="M1 7l3 3 6-6"
        stroke={seen ? "#60a5fa" : "#9ca3af"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      <path
        d="M5 7l3 3 7-7"
        stroke={seen ? "#60a5fa" : "#9ca3af"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const MessageStatus = ({ status }) => {
  if (status === "sent") {
    return <SingleTick />;
  }
  if (status === "delivered") {
    return <DoubleTick seen={false} />;
  }
  if (status === "seen") {
    return <DoubleTick seen={true} />;
  }

  return null;
};
