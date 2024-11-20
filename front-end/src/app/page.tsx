'use client'
import React, { useEffect, useState } from 'react';
import { Layout, Input, notification } from 'antd';
import { Footer, Content } from 'antd/es/layout/layout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
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
      duration: 1.5,
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
    setShowFooter(window.innerHeight > 450);
  };

  useEffect(() => {
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  return (
    <Layout className='h-full' style={bgStyle}>
      <Head>
        {/* TODO:Does it works?*/}
        <title>求是佛典</title>
        <meta property="og:title" content="求是佛典" key="title" />
      </Head>
      {contextHolder}
      <Content className={centerCol}>
        <div className="w-1/2 flex flex-col items-center mt-20">
          <Image
            src="/天下径山.png"
            alt='天下径山'
            width={400}
            height={100}
            className="h-24 sm:h-28 md:h-32 lg:h-36 object-contain"
          />
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
