'use client';
import { LaptopOutlined, NotificationOutlined, UserOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Layout, Menu, FloatButton } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Link from 'next/link';
import { useState } from 'react';

const menuItems = [
  { key: '1', icon: <UserOutlined />, label: '牌记', path: '/overview/colophon' },
  { key: '2', icon: <NotificationOutlined />, label: '序跋', path: '/overview/preface_and_postscript' },
  { key: '3', icon: <LaptopOutlined />, label: '故事', path: '/overview/story' },
];

import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1'); // 默认选中“牌记”

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <section className="h-full">
      <Layout className="h-full">
        <Sider className="h-full relative" collapsed={collapsed}>
          <FloatButton
            onClick={toggleCollapsed}
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            style={{ position: 'absolute', top: '50%', right: '10px' }}
          />
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]} // 使用 selectedKeys
            className="h-full"
            onClick={({ key }) => handleMenuClick(key)} // 处理菜单项点击
          >
            {menuItems.map(item => (
              <Menu.Item key={item.key} icon={item.icon}>
                <Link href={item.path}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Content className="p-6">
          {children}
        </Content>
      </Layout>
    </section>
  );
}


