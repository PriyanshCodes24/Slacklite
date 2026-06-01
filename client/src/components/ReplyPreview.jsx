export const ReplyPreview = ({ replyingTo, setReplyingTo }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-2 mb-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-blue-400">Replying to</p>

          <p className="text-sm text-gray-300 truncate max-w-xs">
            {replyingTo?.content}
          </p>
        </div>

        <button
          onClick={() => setReplyingTo(null)}
          className="text-gray-400 hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
