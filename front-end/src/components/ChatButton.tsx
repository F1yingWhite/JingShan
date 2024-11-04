import { postChat, Message } from '@/lib/chat';
import { CommentOutlined } from '@ant-design/icons';
import { FloatButton, Input, List, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';

export default function ChatButton() {
  const [chatHistory, setChatHistory] = useState<Message[]>([{ role: "assistant", content: "您好,有什么可以帮助你的吗?" }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: Message = { role: 'user', content: inputValue };
      const updatedChatHistory = [...chatHistory, newMessage];
      setChatHistory(updatedChatHistory);
      setInputValue('');

      const response = await postChat(updatedChatHistory);
      const assistantMessage: Message = { role: 'assistant', content: response.response };
      setChatHistory([...updatedChatHistory, assistantMessage]);
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
        <Input.TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="输入消息..."
          style={{ maxHeight: 'calc(15vh)', overflowY: 'auto', resize: "none" }}
        />
      </div>
    </Modal>
  </>
}