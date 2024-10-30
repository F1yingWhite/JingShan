'use client'
import React, { useEffect, useState } from 'react';
import { Layout, Input } from 'antd';
import { Footer, Content } from 'antd/es/layout/layout';
import Image from 'next/image';

const { Search } = Input;

export default function Page() {
  const bgStyle = {
    backgroundColor: '#f4f1ea',
    backgroundImage: 'url(/mainPage.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const footStyle = {
    backgroundColor: "#92754B"
  };

  const search = (value: string) => {
    console.log(value);
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
