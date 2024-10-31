'use client';
import { LaptopOutlined, NotificationOutlined, CreditCardOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Layout, Menu, FloatButton } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const router = useRouter();

  const menuItems = [
    { key: '1', icon: <CreditCardOutlined />, label: '牌记', path: '/search/colophon' },
    { key: '2', icon: <NotificationOutlined />, label: '序跋', path: '/search/preface_and_postscript' },
  ];

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
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
          />
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="h-full"
            onClick={({ key }) => handleMenuClick(key)}
          >
            <Menu.SubMenu key="parent" title="径山藏" icon={<CreditCardOutlined />}>
              {menuItems.map(item => (
                <Menu.Item key={item.key} icon={item.icon}>
                  <Link href={{ pathname: item.path }}>{item.label}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            <Menu.Item key="3" icon={<LaptopOutlined />}>
              <Link href="/overview/story">故事</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className="p-6">
          {children}
        </Content>
      </Layout>
    </section>
  );
}
