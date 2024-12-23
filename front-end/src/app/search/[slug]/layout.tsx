'use client'
import { NotificationOutlined, CreditCardOutlined, LeftOutlined, RightOutlined, UserOutlined, NodeIndexOutlined, SearchOutlined } from '@ant-design/icons';
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
  const [showSider, setShowSider] = useState(false);
  const { slug } = useParams();
  const pathname = usePathname();
  const menuItems = [
    { key: '1', icon: <CreditCardOutlined />, label: '牌记', path: `/search/${slug}/colophon` },
    { key: '2', icon: <NotificationOutlined />, label: '序跋', path: `/search/${slug}/preface_and_postscript` },
    { key: '3', icon: <UserOutlined />, label: '人物', path: `/search/${slug}/individual` },
  ];

  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === pathname);
    if (currentItem) {
      setSelectedKey(currentItem.key);
    } else if (pathname.includes('/graph')) {
      setSelectedKey('4');
    } else if (pathname.includes('/hybrid')) {
      setSelectedKey('全局搜索');
    }
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleSider = () => {
    setShowSider(!showSider);
  };

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
  };

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
            defaultOpenKeys={['径山藏']}
            onClick={({ key }) => handleMenuClick(key)}
          >
            <Menu.Item key="全局搜索" icon={<SearchOutlined />}>
              <Link href={`/search/${slug}/hybrid`}>全局搜索</Link>
            </Menu.Item>
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
        <FloatButton
          onClick={handleFloatButtonClick}
          icon={showSider || collapsed ? <RightOutlined /> : <LeftOutlined />}
          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
        />
        <Content className="p-6">
          <div className='hidden md:block'>
            <ChatButton />
          </div>
          {children}
        </Content>
      </Layout>
    </section>
  );
}