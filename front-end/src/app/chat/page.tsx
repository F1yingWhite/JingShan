'use client'
import React, { useState, useEffect, useRef } from 'react'
import Live2d from '@/components/live2d'
import { Avatar, Button, Spin } from 'antd';
import { AudioMutedOutlined, AudioOutlined, ClearOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { Message, postTTS } from '@/lib/chat';
import { wss_host } from '@/lib/axios';
import ReactMarkdown from 'react-markdown';
export default function Page() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTTSPlaying, setTTSPlaying] = useState(false);
  const [ttsLoading, setTTSLoading] = useState(false);
  const [wavFile, setWavFile] = useState<string>();
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [clickIndex, setClickIndex] = useState<number | null>(null);

  const handleSend = async () => {
    if (inputValue.trim() && !isSending) {
      setIsSending(true);
      const newMessage: Message = { role: 'user', content: inputValue };
      const updatedChatHistory = [...chatHistory, newMessage, { role: 'assistant' as 'assistant', content: '' }];
      setChatHistory(updatedChatHistory);
      setInputValue('');

      const uri = `${wss_host}/chat/ws`;
      const websocket = new WebSocket(uri);

      websocket.onopen = () => {
        websocket.send(JSON.stringify({ messages: updatedChatHistory.slice(0, -1) }));
      };

      websocket.onmessage = (event) => {
        const data = event.data;
        if (data === "[DONE]") {
          websocket.close();
          setIsSending(false);
        } else {
          setChatHistory((prevHistory) => {
            const lastMessageIndex = prevHistory.length - 1;
            const lastMessage = prevHistory[lastMessageIndex];

            if (lastMessage.role === 'assistant') {
              const updatedLastMessage = {
                ...lastMessage,
                content: lastMessage.content + data,
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
        setIsSending(false);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsSending(false); // 确保在发生错误时重置状态
      };
    }
  };

  const beginTTS = async (text: string) => {
    setTTSLoading(true);
    postTTS(text).then((res) => {
      setWavFile(res.data);
      setTTSLoading(false);
    })
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  useEffect(() => {
    return () => {
      setTTSPlaying(false);
    };
  }, []);

  return (
    <div className='w-full h-full flex flex-col items-center'>
      <div className='flex flex-col flex-1 w-full'>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 "> {/* 添加 relative 和 z-10 */}
          {
            chatHistory.map((message, index) => (
              <div
                key={index}
                className={`relative z-10 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start space-x-2 max-w-xl relative"
                  onMouseEnter={() => setHoveredMessageIndex(index)}
                  onMouseLeave={() => setHoveredMessageIndex(null)}
                >
                  {
                    message.role === 'assistant' && (
                      <Avatar className="flex-shrink-0 w-8 h-8">径</Avatar>
                    )
                  }
                  <div className="bg-[#DBD0BE] p-2 rounded-md shadow-md relative">
                    {message.content == "" ? <Spin /> : <ReactMarkdown>{message.content}</ReactMarkdown>}
                    {
                      message.role === 'assistant' && hoveredMessageIndex === index && !isTTSPlaying && !isSending && !ttsLoading && (
                        <AudioMutedOutlined className="absolute -bottom-2 -right-2" onClick={() => {
                          if (!isTTSPlaying) {
                            setClickIndex(index)
                            beginTTS(message.content)
                          }
                        }} />
                      )
                    }
                    {
                      message.role === 'assistant' && clickIndex == index && ttsLoading && (
                        <LoadingOutlined className="absolute -bottom-2 -right-2" />
                      )
                    }
                    {
                      message.role === 'assistant' && clickIndex == index && isTTSPlaying && !ttsLoading && (
                        <AudioOutlined className="absolute -bottom-2 -right-2" onClick={() => {
                          setTTSPlaying(false)
                        }} />
                      )
                    }
                  </div>
                  {
                    message.role === 'user' && (
                      <Avatar className="flex-shrink-0 w-8 h-8">我</Avatar>
                    )
                  }
                </div>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>
        <div className='relative w-full z-0'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full'>
            <div className="max-h-[50vh] aspect-[1/2] overflow-hidden">
              <Live2d isTTSPlaying={isTTSPlaying} setTTSPlaying={setTTSPlaying} wavFile={wavFile} />
            </div>
          </div>
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
          <div className="flex flex-col space-y-2">
            <Button
              icon={<SendOutlined />}
              onClick={handleSend}
              type="primary"
              shape="circle"
            />
            <Button
              type="primary"
              shape="circle"
              icon={<ClearOutlined />}
              onClick={() => {
                setChatHistory([{ role: "assistant", content: "您好,有什么可以帮助你的吗?" }]);
              }}
            />
          </div>
        </div>
      </div>
    </div >
  );
}