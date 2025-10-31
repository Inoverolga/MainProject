// components/tabs/DiscussionTab.jsx
import { useEffect, useState, useRef } from "react";
import Error from "../error/Error.js";
import { useDiscussion } from "../../hooks/discussion/useDiscussion.js";
import Spinner from "../../components/spinner/Spinner.js";
import { toast } from "react-toastify";

import { Card, Badge, Form, Button, Alert } from "react-bootstrap";

const DiscussionTab = ({
  inventoryId,
  isAuthenticated,
  authUser,
  hasWriteAccess,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const { posts, isLoading, error, isSending, sendMessage, isConnected } =
    useDiscussion(inventoryId, hasWriteAccess);

  // Автоскролл к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  // Отправка сообщения
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!isAuthenticated || !hasWriteAccess) {
      toast.error("Нет доступа для отправки сообщений");
      return;
    }

    await sendMessage({
      content: newMessage,
      inventoryId: inventoryId,
    });
    setNewMessage("");
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPostUser = (post) => {
    return post?.user || { id: null, name: "Неизвестный пользователь" };
  };

  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;

  return (
    <div className="discussion-tab">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Badge bg="secondary" className="rounded-pill">
          <i className="bi bi-chat-text me-1"></i>
          {posts.length} сообщений
        </Badge>

        <Badge
          bg={isConnected ? "success" : "warning"}
          className="rounded-pill"
        >
          {isConnected ? "🟢 Real-time" : null}
        </Badge>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <Card.Title className="mb-0 h6">💬 Обсуждение</Card.Title>
        </Card.Header>

        <div style={{ height: "350px", overflow: "auto" }} className="p-3">
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="message-list">
              {posts?.map((post) => {
                const user = getPostUser(post);
                const isCurrentUser = user?.id === authUser?.id;

                return (
                  <div
                    key={post?.id || Math.random()}
                    className={`d-flex mb-3 ${
                      isCurrentUser
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >
                    <Card
                      className={`${
                        isCurrentUser
                          ? "bg-light text-dark"
                          : "bg-body-secondary text-dark"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      <Card.Body className="p-2">
                        <div className="d-flex align-items-center mb-1">
                          <small className="fw-bold">
                            {user?.name || "Неизвестный пользователь"}
                          </small>
                          <small className="ms-2 text-body-secondary">
                            {post?.createdAt
                              ? new Date(post.createdAt).toLocaleTimeString()
                              : ""}
                          </small>
                        </div>
                        <div className="message-content">
                          {post?.content || ""}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Форма ввода */}
        {isAuthenticated && hasWriteAccess ? (
          <Card.Footer>
            <Form.Group>
              <div className="input-group">
                <Form.Control
                  type="text"
                  placeholder={
                    isSending ? "Отправка..." : "Напишите сообщение..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isSending}
                />
                <Button
                  variant="secondary"
                  onClick={handleSend}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? "Отправка..." : "Отправить"}
                </Button>
              </div>
            </Form.Group>
          </Card.Footer>
        ) : !isAuthenticated ? (
          <Card.Footer className="bg-light text-center">
            <small className="text-muted">
              Войдите в систему, чтобы участвовать в обсуждении
            </small>
          </Card.Footer>
        ) : (
          <Card.Footer className="bg-light text-center">
            <small className="text-muted">
              У вас нет прав для отправки сообщений в этом инвентаре
            </small>
          </Card.Footer>
        )}
      </Card>

      {/* Подсказка про Markdown */}
      {isAuthenticated && hasWriteAccess && (
        <Alert variant="light" className="mt-3">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            <strong>Поддерживается Markdown:</strong> **жирный** • *курсив* •
            [ссылка](url)
          </small>
        </Alert>
      )}
    </div>
  );
};

export default DiscussionTab;
