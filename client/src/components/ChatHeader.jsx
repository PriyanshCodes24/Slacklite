import { IoArrowBackOutline } from "react-icons/io5";
import { getInitials } from "../utils/getInitials";
import { formatLastSeen } from "../utils/formatLastSeen";

export const ChatHeader = ({
  navigate,
  activeConversation,
  onlineUsers,
  receiverId,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="md:hidden text-gray-300 hover:text-white cursor-pointer text-xl"
        >
          <IoArrowBackOutline />
        </button>

        <div className="relative shrink-0">
          <div className="bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm">
            {getInitials(activeConversation?.user?.name)}
          </div>

          <span
            className={`absolute h-3 w-3 rounded-full right-0 bottom-0 border-2 border-gray-900 ${onlineUsers.includes(receiverId) ? "bg-green-400" : "bg-gray-500"}`}
          ></span>
        </div>
        <div className="">
          <h2 className="text-white text-lg font-semibold leading-tight">
            {activeConversation?.user?.name || "Chat"}
          </h2>

          <p className="text-xs text-gray-400">
            {onlineUsers.includes(receiverId)
              ? "Online"
              : `Last Seen ${formatLastSeen(activeConversation?.user?.lastSeen)}`}
          </p>
        </div>
      </div>
    </div>
  );
};
