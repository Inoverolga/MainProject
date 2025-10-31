import { useEffect } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import useWebSocket from "react-use-websocket";
import {
  fetchPostsGetMessage,
  fetchPostsCreateMessage,
} from "../../service/api.js";

const getWebSocketUrl = (inventoryId) => {
  if (!inventoryId) return null;

  const isProduction = process.env.NODE_ENV === "production";
  const protocol = isProduction ? "wss:" : "ws:";
  const host = isProduction
    ? "mainproject-back.onrender.com"
    : "localhost:3001";
  const token = localStorage.getItem("accessToken");
  let url = `${protocol}//${host}/ws/api/posts?inventoryId=${inventoryId}`;
  if (token) url += `&token=${encodeURIComponent(token)}`;

  return url;
};

export const useDiscussion = (inventoryId) => {
  const { lastMessage, readyState } = useWebSocket(
    getWebSocketUrl(inventoryId),
    {
      shouldReconnect: () => true,
    }
  );

  const { data, error, mutate, isLoading } = useSWR(
    inventoryId ? `/posts?inventoryId=${inventoryId}` : null,
    fetchPostsGetMessage
  );

  const { trigger: sendMessage, isMutating: isSending } = useSWRMutation(
    "/posts/create-post",
    async (url, { arg }) => {
      return await fetchPostsCreateMessage(url, arg);
    }
  );

  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const newMessage = JSON.parse(lastMessage.data);

        if (newMessage?.type === "NEW_MESSAGE" && newMessage?.data?.id) {
          mutate((current) => {
            if (!current) return { data: [newMessage.data] };

            const exists = current.data?.some(
              (msg) => msg?.id === newMessage.data.id
            );
            return exists
              ? current
              : {
                  ...current,
                  data: [...(current.data || []), newMessage.data],
                };
          }, false);
        }
      } catch (error) {
        console.error("❌ Ошибка парсинга WebSocket сообщения:", error);
      }
    }
  }, [lastMessage, mutate]);

  return {
    posts: data?.data || [],
    isLoading: !data && !error && inventoryId,
    error,
    isSending,
    sendMessage,
    isConnected: readyState === 1,
  };
};
