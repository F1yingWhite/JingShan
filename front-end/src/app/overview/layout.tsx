'use client';
import { useEffect, useRef, useState } from 'react';
import { LaptopOutlined, NotificationOutlined, CreditCardOutlined, LeftOutlined, RightOutlined, CommentOutlined } from '@ant-design/icons';
import { Layout, Menu, FloatButton, Modal, List, Input, Button } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { postChat, Message } from '@/lib/chat';
import Link from 'next/link';

const menuItems = [
  { key: '1', icon: <CreditCardOutlined />, label: '牌记', path: '/overview/colophon' },
  { key: '2', icon: <NotificationOutlined />, label: '序跋', path: '/overview/preface_and_postscript' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const toggleCollapsed = () => setCollapsed(!collapsed);

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

  return (
    <section className="h-full">
      <Layout className="h-full">
        <Sider className="h-full relative" collapsed={collapsed}>
          <FloatButton
            onClick={toggleCollapsed}
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
          />
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="h-full"
            onClick={({ key }) => setSelectedKey(key)}
          >
            <Menu.SubMenu key="径山藏" title="径山藏" icon={<CreditCardOutlined />}>
              {menuItems.map(item => (
                <Menu.Item key={item.key} icon={item.icon}>
                  <Link href={item.path}>{item.label}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            <Menu.Item key="3" icon={<LaptopOutlined />}>
              <Link href="/overview/story">故事</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className="p-6">
          {!isModalOpen && <FloatButton
            icon={<CommentOutlined />}
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
            style={{ position: 'fixed', right: '20px', zIndex: 9 }}
            wrapClassName="custom-modal"
            title="径山chat"
            bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}
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
                        {item.role === 'user' ? '我' : '助手'}:
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
          {children}
        </Content>
      </Layout>
      <style jsx global>{`
                    .custom - modal.ant - modal - content {
          height: calc(90vh - 80px);
                display: flex;
                flex-direction: column;
        }
      `}</style>
    </section>
  );
}