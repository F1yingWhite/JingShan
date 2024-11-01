'use client'
import React, { useEffect, useState } from 'react';
import { Layout, Input, notification } from 'antd';
import { Footer, Content } from 'antd/es/layout/layout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
const { Search } = Input;

export default function Page() {
  const router = useRouter();
  const bgStyle = {
    backgroundColor: '#f4f1ea',
    backgroundImage: 'url(/mainPage.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const footStyle = {
    backgroundColor: "#92754B"
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotification = () => {
    api.open({
      message: '⚠️警告',
      description:
        '请输入搜索内容',
      duration: 1.5, // 设置自动关闭时间为 1.5 秒
    });
  };
  const search = (value: string) => {
    if (value.trim()) {
      value = encodeURIComponent(value);
      router.push(`/search/${value}/colophon`);
    } else {
      openNotification();
    }
  };

  const centerCol = "flex flex-col items-center";

  const [showFooter, setShowFooter] = useState(true);

  const checkHeight = () => {
    setShowFooter(window.innerHeight > 400);
  };

  useEffect(() => {
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  return (
    <Layout className='h-full' style={bgStyle}>
      {contextHolder}
      <Content className={centerCol}>
        <div className="w-1/2 flex flex-col items-center mt-20">
          <Image src="/天下径山.png" alt='天下径山' width={400} height={100} />
          <Search
            allowClear
            enterButton="搜索"
            size="large"
            placeholder='请输入关键字'
            className='mt-3 text-black'
            onSearch={search}
          />
        </div>
      </Content>
      {showFooter && (
        <Footer style={footStyle} className={centerCol}>
          <div className="flex justify-center text-white">
            @2024 powered by eagle-lab
          </div>
          <div className="flex justify-center text-white">
            联系我们: xlz24@163.com
          </div>
        </Footer>
      )}
    </Layout>
  );
}
