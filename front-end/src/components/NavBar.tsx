'use client'
import React, { useState } from 'react';
import { Avatar, Flex, Input, Layout, Modal, Space } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserStore } from '@/store/useStore';
import LoginPage, { tabsType } from './LoginFrom';
const { Header } = Layout;

interface NavItemProps {
  href: string;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, text }) => {
  const path = usePathname();
  const isCurrentPath =
    path === href || (path.startsWith(href) && (path === href || path[href.length] === '/'));
  const textColor = isCurrentPath ? 'text-[#1A2B5C]' : 'text-[#FFF]';
  const hoverColor = 'hover:text-[#1A2B5C] hover:bg-[#DBDEF0]';
  const bgColor = isCurrentPath ? 'bg-[#DBDEF0]' : '';

  return (
    <div className={`${hoverColor} ${bgColor} h-full flex justify-center items-center w-[10vw]`}>
      <Link
        href={href}
        className={`sm:text-base md:text-lg lg:text-xl pt-2 pb-2 ${textColor}`}
      >
        <span className="text-center">{text}</span>
      </Link>
    </div>
  );
};

const IconList: NavItemProps[] = [
  {
    href: "/",
    text: "主页"
  },
  {
    href: "/overview",
    text: "文库"
  },
  {
    href: "/graph",
    text: "图谱"
  },
  {
    href: "/dependent",
    text: "缘起"
  },
  {
    href: "/chat",
    text: "智答"
  }
]

export default function NavBar() {
  const router = useRouter();
  const { user } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<tabsType>('account');
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Header className="flex items-center justify-between h-[60px]" style={{ backgroundColor: "#1A2B5C" }}>
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <LoginPage type={type} setType={setType} setIsModalOpen={setIsModalOpen} ></LoginPage>
      </Modal>
      <Flex justify="start" className="items-center ml-0 h-full cursor-pointer" onClick={() => { router.push(`/`) }}>
        <Image src="/logo.svg" alt="佛经" width={45} height={45} />
        <div className="ml-2 h-10 border-l-2 border-[#DAA520] hidden md:block"></div>
        <div className="ml-2 text-base font-bold text-center hidden md:block">
          <div className='md:text-xl lg:text-2xl'>
            <div className='text-white flex justify-center' style={{ lineHeight: '1.3' }}>
              <span>求是</span>
              <span className='text-[#DAA520]'>智藏</span>
            </div>
          </div>
          <div className='md:text-[7px] lg:text-[8px]'>
            <div className='text-white flex justify-center' style={{ lineHeight: '1.3' }}>
              <span>QIUSHI&nbsp;</span>
              <span className='text-[#DAA520]'>Digital Archive</span>
            </div>
          </div>
        </div>
      </Flex>

      <Flex justify="center" className="h-full">
        {IconList.map((icon, index) => (
          <NavItem key={index} href={icon.href} text={icon.text} />
        ))}
      </Flex>

      <Flex justify="center" className='h-full text-white flex items-center'>
        <Space wrap size={16}>
          <div className="cursor-pointer"
            onClick={() => {
              setType('account');
              setIsModalOpen(true)
            }}>
            登录
          </div>
          <div className="h-5 border-l-2 border-white" />
          <div className="cursor-pointer"
            onClick={() => {
              setType('register');
              setIsModalOpen(true)
            }}>
            注册
          </div>
          {user ? (
            user.avatar ? (
              <Avatar className='mx-2' size={45} src={user.avatar} />
            ) : (
              <Avatar className='mx-2' style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} size={45}>user.name[0]</Avatar>
            )
          ) : (
            <Avatar className='mx-2' size={45} src={"/heshang.png"} />
          )}
        </Space>
      </Flex>
    </Header>
  );
}
