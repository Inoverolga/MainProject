import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const LikeButton = ({
  itemId,
  likeData,
  onToggleLike,
  size = "md",
  showCount = true,
  className = "",
  isAuthenticated,
}) => {
  const { t } = useTranslation();
  const { likeCount = 0, isLiked = false } = likeData || {};

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info(t("loginRequiredForLikes"));
      return;
    }
    onToggleLike(itemId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAuthenticated}
      className={`
        flex items-center gap-1
        bg-transparent border-none outline-none p-0
        ${isLiked ? "text-red-500" : "text-gray-400"}
        cursor-pointer hover:scale-105
        transition-all duration-200
        ${className}
      `}
    >
      <Heart
        size={20}
        fill={isLiked ? "#4B5563" : "none"}
        stroke={isLiked ? "#4B5563" : "#9CA3AF"}
        strokeWidth={1.5}
      />
      {showCount && (
        <span
          className={`text-sm ${isLiked ? "text-red-500" : "text-gray-600"}`}
        >
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
