'use client'
import React from 'react'
import { Flex, Layout } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header } = Layout;

export default function NavBar() {
  const path = usePathname();
  const headerStyle = {
    backgroundColor: '#f4f1ea',
    backgroundImage: path === '/' ? 'url(/navBg.png)' : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <Header style={headerStyle} className='flex items-center justify-between'>
      <Flex justify="center" className='text-2xl font-bold text-blue-300'>
        求是佛典
      </Flex>
      <Flex justify="center">
        <Link href="/1" className='mx-4'>求是</Link>
        <Link href="/2" className='mx-4'>创新</Link>
      </Flex>
    </Header>
  )
}
