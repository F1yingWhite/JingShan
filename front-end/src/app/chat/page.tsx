'use client'
import React, { useState, useEffect, useRef } from 'react'
import Live2d from '@/components/live2d'
import { Avatar, GetProp, Space, Spin, Typography } from 'antd';
import { AudioOutlined, FireOutlined, LoadingOutlined, OpenAIOutlined, } from '@ant-design/icons';
import { Message, postTTS } from '@/lib/chat';
import { wss_host } from '@/lib/axios';
import ReactMarkdown from 'react-markdown';
import { Bubble, Prompts, Sender, Welcome } from '@ant-design/x';

const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);


const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, '热门问题'),
    description: '您对什么感兴趣',
    children: [
      {
        key: '1-1',
        description: `径山寺有哪些禅师?`,
      },
      {
        key: '1-2',
        description: `径山寺有哪些法侣?`,
      },
      {
        key: '1-3',
        description: `径山寺的历史?`,
      }
    ],
  },
];

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

  const onPromptsItemClick = (info) => {
    handleSend(info.data.description);
  };

  const handleSend = async (inputValues: string) => {
    if (inputValues.trim() && !isSending) {
      setIsSending(true);
      const newMessage: Message = { role: 'user', content: inputValues };
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
        setIsSending(false);
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


  const placeholderNode = (
    <Space direction="vertical" size={14} >
      <Welcome
        variant="borderless"
        icon="https://picture-bed-1325530970.cos.ap-nanjing.myqcloud.com/%E6%9C%A8%E9%B1%BC.svg"
        title="径山Chat"
        description="施主您好,我是径山寺智能AI,有任何问题可以询问我~"
      />
      <Prompts
        title="您想知道什么?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );


  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex-1 overflow-y-auto p-4 space-y-4  h-full'>
        {
          chatHistory.length !== 0 ? (
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
                    {message.content === "" ? (
                      <Spin />
                    ) : (
                      <div
                        onClick={() => {
                          if (message.role === 'assistant' && !isTTSPlaying && !isSending && !ttsLoading) {
                            setClickIndex(index);
                            beginTTS(message.content);
                          }
                        }}
                      >
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
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
          ) : (
            <div className="flex justify-center items-center">
              <Bubble.List
                className='z-10'
                items={[{ content: placeholderNode, variant: 'borderless' }]}
              />
            </div>
          )
        }
        <div ref={messagesEndRef} />
      </div>

      {/* 动态显示 Live2d */}
      {
        chatHistory.length !== 0 && (
          <div className='relative w-full z-0'>
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full'>
              <div className="max-h-[50vh] aspect-[2/3] overflow-hidden">
                <Live2d isTTSPlaying={isTTSPlaying} setTTSPlaying={setTTSPlaying} wavFile={wavFile} />
              </div>
            </div>
          </div>
        )
      }

      <div className="flex justify-center items-end pb-4">
        <Sender
          style={{ width: '75vw' }}
          value={inputValue}
          submitType="shiftEnter"
          onChange={setInputValue}
          onSubmit={() => { handleSend(inputValue) }}
          actions={(_, info) => {
            const { SendButton, LoadingButton, ClearButton } = info.components;
            return (
              <Space size="small">
                <Typography.Text type="secondary">
                  <small>`Shift + Enter` to submit</small>
                </Typography.Text>
                <ClearButton />
                {isSending ? (
                  <LoadingButton type="default" icon={<Spin size="small" />} disabled />
                ) : (
                  <SendButton type="primary" icon={<OpenAIOutlined />} disabled={false} />
                )}
              </Space>
            );
          }}
        />
      </div>
    </div>
  );
}
