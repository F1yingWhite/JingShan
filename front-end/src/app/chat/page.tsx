'use client'
import React, { useState, useEffect, useRef } from 'react'
import Live2d from '@/components/live2d'
import { Avatar, Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { postChat, Message } from '@/lib/chat';
import { CommentOutlined } from '@ant-design/icons';
import { ws_host } from '@/lib/axios';
import ReactMarkdown from 'react-markdown';

export default function Page() {
  const [chatHistory, setChatHistory] = useState<Message[]>([{ role: "assistant", content: "您好,有什么可以帮助你的吗?" }]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false); // 添加状态来跟踪是否正在发送消息
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (inputValue.trim() && !isSending) { // 确保发送的内容不能为空并且没有正在发送的消息
      setIsSending(true); // 设置状态为正在发送
      const newMessage: Message = { role: 'user', content: inputValue };
      const updatedChatHistory = [...chatHistory, newMessage, { role: 'assistant' as 'assistant', content: '' }];
      setChatHistory(updatedChatHistory);
      setInputValue('');

      const uri = `${ws_host}/chat/ws`;
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
        if (event.wasClean) {
          console.log("WebSocket connection closed normally");
        } else {
          console.error("WebSocket connection closed unexpectedly");
        }
        setIsSending(false); // 确保在连接关闭时重置状态
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsSending(false); // 确保在发生错误时重置状态
      };
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <div className='w-full h-full flex'>
      <div className='flex-shrink-0 w-1/4 flex items-center justify-center'>
        <div style={{ width: '100%', aspectRatio: '1 / 2', maxHeight: '200%' }}>
          <Live2d />
        </div>
      </div>
      <div className='flex flex-col flex-1 w-3/4'>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((message) => (
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start space-x-2 max-w-xl">
                {message.role === 'assistant' && (
                  <Avatar className="flex-shrink-0 w-8 h-8">径</Avatar>
                )}
                <div className="bg-[#DBD0BE] p-2 rounded-md shadow-md">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.role === 'user' && (
                  <Avatar className="flex-shrink-0 w-8 h-8">我</Avatar>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-100 flex items-center h-1/4">
          <TextArea
            placeholder="请输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            style={{ resize: 'none', height: '100%' }}
            className="flex-1 mr-2"
          />
          <Button
            icon={<SendOutlined />}
            onClick={handleSend}
            type="primary"
            shape="circle"
          />
        </div>
      </div>
    </div>
  )
}