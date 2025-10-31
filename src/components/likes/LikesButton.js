import { Heart } from "lucide-react";
import { useLikes } from "../../hooks/likes/useLikes.js";
import Spinner from "../../components/spinner/Spinner.js";

const LikeButton = ({
  itemId,
  size = "md",
  showCount = true,
  className = "",
}) => {
  const { toggleLike, isLiked, likeCount, isToggling, isLoading } =
    useLikes(itemId);

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleClick = (e) => {
    //e.stopPropagation();
    e.preventDefault();
    //e.nativeEvent.stopImmediatePropagation();
    toggleLike();
  };

  if (isLoading) return <Spinner />;
  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={`
        flex items-center gap-1
        bg-transparent border-none outline-none p-0
        ${isLiked ? "text-red-500" : "text-gray-400"}
        ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
          className={`font-medium ${textSizes[size]} ${
            isLiked ? "text-red-500" : "text-gray-600"
          }`}
        >
          {likeCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
