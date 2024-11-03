'use client';
import { useState } from 'react';
import { LaptopOutlined, NotificationOutlined, CreditCardOutlined, LeftOutlined, RightOutlined, CommentOutlined } from '@ant-design/icons';
import { Layout, Menu, FloatButton } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Link from 'next/link';
import ChatButton from '@/components/ChatButton';

const menuItems = [
  { key: '1', icon: <CreditCardOutlined />, label: '牌记', path: '/overview/colophon' },
  { key: '2', icon: <NotificationOutlined />, label: '序跋', path: '/overview/preface_and_postscript' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');


  const toggleCollapsed = () => setCollapsed(!collapsed);

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
          <ChatButton />
          {children}
        </Content>
      </Layout>

    </section>
  );
}