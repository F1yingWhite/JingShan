'use client'
import React, { useState } from 'react';
import { Avatar, Flex, Layout, Modal, Space, Drawer, MenuProps, Dropdown, Menu, message, } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserStore } from '@/store/useStore';
import LoginPage, { tabsType } from './LoginFrom';
import { CloseOutlined, LogoutOutlined } from '@ant-design/icons';
const { Header } = Layout;

interface UserAvatarProps {
  user: {
    avatar?: string;
    username: string;
  } | null;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, onClick }) => {
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <>
      {user ? (
        user.avatar ? (
          <Avatar className={`mx-2 ${cursorClass}`} size={45} src={user.avatar} onClick={onClick} />
        ) : (
          <Avatar className={`mx-2 ${cursorClass}`} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} size={45} onClick={onClick}>
            {user.username[0]}
          </Avatar>
        )
      ) : (
        <Avatar className={`mx-2 ${cursorClass}`} size={45} src={"/heshang.png"} />
      )}
    </>
  );
};


interface NavItemProps {
  href: string;
  text: string;
  items?: MenuProps['items']
}

const items: MenuProps['items'] = [
  {
    key: '径山藏',
    type: 'group',
    label: (
      <Link href={'/overview'}>
        径山藏
      </Link>
    ),
    children: [
      {
        key: '牌记',
        label: (
          <Link href={'/overview/colophon'}>
            牌记
          </Link>
        ),
      },
      {
        key: '序跋',
        label: (
          <Link href={'/overview/preface_and_postscript'}>
            序跋
          </Link>
        ),
      },
      {
        key: '人物',
        label: (
          <Link href={'/overview/individual'}>
            人物
          </Link>
        )
      },
      {
        key: '故事',
        label: (
          <Link href={'/overview/story'}>
            故事
          </Link>
        ),
      },
    ]
  },
  {
    key: '径山志',
    label: (
      <Link href={'/overview/graph'}>
        径山志
      </Link>
    ),
  }
];

const NavItem: React.FC<NavItemProps> = ({ href, text, items }) => {
  const path = usePathname();
  const isCurrentPath =
    path === href || (path.startsWith(href) && (path === href || path[href.length] === '/'));
  const textColor = isCurrentPath ? 'text-[#1A2B5C]' : 'text-[#FFF]';
  const hoverColor = 'hover:text-[#1A2B5C] hover:bg-[#DBDEF0]';
  const bgColor = isCurrentPath ? 'bg-[#DBDEF0]' : '';

  return (
    <div className={`${hoverColor} ${bgColor} h-full flex justify-center items-center`}>
      {items ? (
        <Dropdown menu={{ items }} trigger={['hover']} placement="bottomLeft"
          overlayStyle={{ width: '20vw', maxWidth: "200px" }}
        // TODO:修改下拉菜单的样式
        >
          <Link
            href={href}
            className={`sm:text-base md:text-lg lg:text-xl pt-2 pb-2 ${textColor} w-[10vw] max-w-[100px] flex justify-center `}
          >
            <span className="text-center">文库</span>
          </Link>
        </Dropdown>
      ) : (
        <Link
          href={href}
          className={`sm:text-base md:text-lg lg:text-xl pt-2 pb-2 ${textColor} w-[10vw] max-w-[100px] flex justify-center`}
        >
          <span className="text-center">{text}</span>
        </Link>
      )
      }
    </div >
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

interface DrawerItemProps {
  text: string,
  icon: React.ReactNode,
  onClick?: () => void;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ text, icon, onClick }) => {

  return <>
    <div className='flex items-center cursor-pointer rounded-md hover:bg-gray-200' onClick={onClick}>
      <div className='mr-2'>{icon}</div>
      <div>{text}</div>
    </div>
  </>
}


export default function NavBar() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<tabsType>('account');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onClose = () => {
    setIsDrawerOpen(false);
  };

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Header className="flex items-center justify-between" style={{ backgroundColor: "#1A2B5C", height: "64px", paddingLeft: "10px", paddingRight: "10px" }}>
      {contextHolder}
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <LoginPage type={type} setType={setType} setIsModalOpen={setIsModalOpen} ></LoginPage>
      </Modal>

      <Drawer
        className='rounded-l-xl'
        closeIcon={false}
        onClose={onClose}
        open={isDrawerOpen}
        title={
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <UserAvatar user={user} />
              <div className='ml-4'>
                {user ? user.username : null}
              </div>
            </div>
            <CloseOutlined onClick={onClose} />
          </div>
        }
      >
        <DrawerItem icon={<LogoutOutlined />} text='退出登录' onClick={() => {
          setUser(null);
          messageApi.success('注销成功,请重新登陆');
          setIsDrawerOpen(false);
        }} />
      </Drawer>

      <div className='hidden md:block'>
        <Flex justify="start" className="items-center ml-0 h-full cursor-pointer" onClick={() => { router.push(`/`) }}>
          <Image src="/logo.svg" alt="佛经" width={45} height={45} />
          <div className="ml-2 h-10 border-l-2 border-[#DAA520]"></div>
          <div className="ml-2 text-base font-bold text-center">
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
      </div>

      <Flex justify="center" className="h-full">
        {IconList.map((icon, index) => (
          icon.text === "文库" ? (
            <NavItem key={index} href={icon.href} text={icon.text} items={items} />
          ) :
            (<NavItem key={index} href={icon.href} text={icon.text} />)
        ))}
      </Flex>

      <Flex justify="center" className='h-full text-white flex items-center'>
        <Space wrap size={16}>
          {!user ? (<>
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
          </>) : null
          }
          <UserAvatar user={user} onClick={() => setIsDrawerOpen(true)} />
        </Space>
      </Flex>
    </Header >
  );
}
