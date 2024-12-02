import { Message } from '@/lib/chat';
import { CommentOutlined } from '@ant-design/icons';
import { Button, FloatButton, Input, List, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { wss_host } from '@/lib/axios';

export default function ChatButton() {
  const [chatHistory, setChatHistory] = useState<Message[]>([{ role: "assistant", content: "您好,有什么可以帮助你的吗?" }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false); // 添加状态来跟踪是否正在发送消息
  const listRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isSending) { // 确保发送的内容不能为空并且没有正在发送的消息
      setIsSending(true);
      const newMessage: Message = { role: 'user', content: inputValue };
      const updatedChatHistory = [...chatHistory, newMessage, { role: 'assistant' as 'assistant', content: '' }];
      setChatHistory(updatedChatHistory);
      setInputValue('');

      const uri = `${wss_host}/chat/ws`;
      const websocket = new WebSocket(uri);

      websocket.onopen = () => {
        websocket.send(JSON.stringify({ messages: updatedChatHistory.slice(0, -1) }));
        console.log(updatedChatHistory)
      };

      websocket.onmessage = (event) => {
        const data = event.data;
        if (data === "[DONE]") {
          websocket.close();
          setIsSending(false); // 设置状态为未发送
        } else {
          // 确保消息仅在上一次的 assistant 消息基础上追加
          setChatHistory((prevHistory) => {
            const lastMessageIndex = prevHistory.length - 1;
            const lastMessage = prevHistory[lastMessageIndex];

            if (lastMessage.role === 'assistant') {
              const updatedLastMessage = {
                ...lastMessage,
                content: lastMessage.content + data, // 追加新内容
              };

              return [
                ...prevHistory.slice(0, lastMessageIndex),
                updatedLastMessage,
              ];
            }
            return prevHistory;
          });
        }
      };

      websocket.onclose = (event) => {
        setIsSending(false);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsSending(false);
      };
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return <>
    {!isModalOpen && <FloatButton
      icon={<CommentOutlined />}
      type='primary'
      style={{ position: 'fixed', bottom: '20px', right: '20px', width: '40px', height: '40px', zIndex: 9 }}
      onClick={() => setIsModalOpen(true)}
    />}
    <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      mask={false}
      maskClosable={false}
      footer={null}
      width="40%"
      style={{ position: 'fixed', right: '20px', zIndex: 9, overflowY: 'auto', maxHeight: 'calc(89vh - 80px)' }}
      wrapClassName={"pointer-events-none"}
      title="径山chat"
    >
      <div style={{ width: '100%', height: '100%' }}>
        <div ref={listRef} style={{ minHeight: 'calc(65vh - 80px)', maxHeight: 'calc(65vh - 80px)', overflowY: 'auto', marginBottom: '10px' }}>
          <List
            size="small"
            bordered
            dataSource={chatHistory}
            renderItem={item => (
              <List.Item style={{ textAlign: item.role === 'user' ? 'right' : 'left' }}>
                <div className="font-bold">
                  {item.role === 'user' ? '我' : '径山chat'}:
                </div>
                <div>
                  {item.content}
                </div>
              </List.Item>
            )}
          />

        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input.TextArea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="输入消息..."
            style={{ maxHeight: 'calc(15vh)', overflowY: 'auto', resize: "none", flex: 1 }}
          />
          <Button type='primary' style={{ maxHeight: 'calc(15vh)' }} onClick={() => { setChatHistory([]) }}>清空</Button>
        </div>
      </div>
    </Modal>
  </>
}