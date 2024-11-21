'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LaptopOutlined, NotificationOutlined, CreditCardOutlined, LeftOutlined, RightOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Layout, Menu, FloatButton } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Link from 'next/link';
import ChatButton from '@/components/ChatButton';

const menuItems = [
  { key: '1', icon: <CreditCardOutlined />, label: '牌记', path: '/overview/colophon' },
  { key: '2', icon: <NotificationOutlined />, label: '序跋', path: '/overview/preface_and_postscript' },
  { key: '3', icon: <LaptopOutlined />, label: '故事', path: '/overview/story' },
  { key: '4', icon: <NodeIndexOutlined />, label: '径山志', path: '/overview/graph' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [showSider, setShowSider] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === pathname);
    if (currentItem) {
      setSelectedKey(currentItem.key);
    }
  }, [pathname]);

  const toggleCollapsed = () => setCollapsed(!collapsed);
  const toggleSider = () => setShowSider(!showSider);

  const handleFloatButtonClick = () => {
    if (window.innerWidth >= 768) {
      toggleCollapsed();
    } else {
      toggleSider();
    }
  };

  return (
    <section className="h-full">
      <Layout className="h-full">
        <Sider className={`h-full relative ${showSider ? 'block' : 'hidden'} md:block`} collapsed={collapsed}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="h-full"
            onClick={({ key }) => setSelectedKey(key)}
            defaultOpenKeys={['径山藏']}
          >
            <Menu.SubMenu key="径山藏" title="径山藏" icon={<CreditCardOutlined />}>
              {menuItems.slice(0, 2).map(item => (
                <Menu.Item key={item.key} icon={item.icon}>
                  <Link href={item.path}>{item.label}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            {menuItems.slice(2).map(item => (
              <Menu.Item key={item.key} icon={item.icon}>
                <Link href={item.path}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <FloatButton
          onClick={handleFloatButtonClick}
          icon={showSider || collapsed ? <RightOutlined /> : <LeftOutlined />}
          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
        />
        <Content className="p-6">
          <ChatButton />
          {children}
        </Content>
      </Layout>
    </section>
  );
}