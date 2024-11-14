'use client'
import { NotificationOutlined, CreditCardOutlined, LeftOutlined, RightOutlined, UserOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Layout, Menu, FloatButton } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import ChatButton from '@/components/ChatButton';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const { slug } = useParams();
  const pathname = usePathname();

  const menuItems = [
    { key: '1', icon: <CreditCardOutlined />, label: '牌记', path: `/search/${slug}/colophon` },
    { key: '2', icon: <NotificationOutlined />, label: '序跋', path: `/search/${slug}/preface_and_postscript` },
    { key: '3', icon: <UserOutlined />, label: '人物', path: `/search/${slug}/individual` },
    { key: '4', icon: <NodeIndexOutlined />, label: '径山志', path: `/search/${slug}/graph` },
  ];

  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === pathname);
    if (currentItem) {
      setSelectedKey(currentItem.key);
    }
  }, [pathname]);

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
            defaultOpenKeys={['径山藏']}
            onClick={({ key }) => handleMenuClick(key)}
          >
            <Menu.SubMenu key="径山藏" title="径山藏" icon={<CreditCardOutlined />}>
              {menuItems.slice(0, 3).map(item => (
                <Menu.Item key={item.key} icon={item.icon}>
                  <Link href={item.path}>{item.label}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            <Menu.Item key="4" icon={<NodeIndexOutlined />}>
              <Link href={`/search/${slug}/graph`}>径山志</Link>
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