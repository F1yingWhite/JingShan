'use client'
import React, { useState } from 'react';
import { Avatar, Flex, Layout, Modal, Space, Drawer, MenuProps, Dropdown, message, Input, DropdownProps, } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserStore } from '@/store/useStore';
import LoginModal, { tabsType } from './modal/LoginModal';
import { CloseOutlined, FontColorsOutlined, LockOutlined, LogoutOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { UserPasswordModal, utilsType } from '@/components/modal/UserModal';
import UserAvatar from './UserAvatar';

const { Header } = Layout;



interface NavItemProps {
  href: string;
  text: string;
  items?: MenuProps['items']
}


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
  },
  {
    href: "/manage",
    text: "管理"
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

const SiderDrawer = ({ user, isDrawerOpen, setIsDrawerOpen, setUtilsType, setUserModalOpen, setUser, messageApi }) => {
  return <Drawer
    className='rounded-l-xl'
    closeIcon={false}
    onClose={() => { setIsDrawerOpen(false) }}
    open={isDrawerOpen}
    title={
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <UserAvatar user={user} />
          <div className='ml-4'>
            {user ? user.username : null}
          </div>
        </div>
        <CloseOutlined onClick={() => { setIsDrawerOpen(false) }} />
      </div>
    }
  >
    <Space direction='vertical'>
      <DrawerItem icon={<UserOutlined />} text='修改头像' onClick={() => {
        setUtilsType('avatar');
        setUserModalOpen(true);
        setIsDrawerOpen(false);
      }} />
      <DrawerItem icon={<LockOutlined />} text='修改密码' onClick={() => {
        setUtilsType('password');
        setUserModalOpen(true);
        setIsDrawerOpen(false);
      }} />
      <DrawerItem icon={<FontColorsOutlined />} text='修改用户名' onClick={() => {
        setUtilsType('username');
        setUserModalOpen(true);
        setIsDrawerOpen(false);
      }} />

      <DrawerItem icon={<LogoutOutlined />} text='退出登录' onClick={() => {
        setUser(null);
        window.localStorage.removeItem('autoLogin');
        messageApi.success('注销成功,请重新登陆');
        setIsDrawerOpen(false);
      }} />
    </Space>
  </Drawer>
}

const items: MenuProps['items'] = [
  {
    key: '径山藏',
    type: 'group',
    label: (
      <Link href={'/overview'} className='sm:text-sm md:text-base lg:text-lg text-black'>
        径山藏
      </Link>
    ),
    children: [
      {
        key: '牌记',
        label: (
          <Link href={'/overview/colophon'} className='sm:text-sm md:text-base lg:text-lg pl-4'>
            牌记
          </Link>
        ),
      },
      {
        key: '序跋',
        label: (
          <Link href={'/overview/preface_and_postscript'} className='sm:text-sm md:text-base lg:text-lg pl-4'>
            序跋
          </Link>
        ),
      },
      {
        key: '人物',
        label: (
          <Link href={'/overview/individual'} className='sm:text-sm md:text-base lg:text-lg pl-4'>
            人物
          </Link>
        )
      },
      {
        key: '故事',
        label: (
          <Link href={'/overview/story'} className='sm:text-sm md:text-base lg:text-lg pl-4'>
            故事
          </Link>
        ),
      },
    ]
  },
  {
    key: '径山志',
    label: (
      <Link href={'/overview/graph'} className='sm:text-sm md:text-base lg:text-lg'>
        径山志
      </Link>
    ),
  }
];

export default function NavBar() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [searchValue, setSearchValue] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [type, setType] = useState<tabsType>('account');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [utilsType, setUtilsType] = useState<utilsType>('password');
  const [searchOpen, setSearchOpen] = useState(false);

  const searchItems: MenuProps['items'] = [
    {
      key: 'search',
      label: (
        <Input
          placeholder="搜索"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={_ => {
            search(searchValue);
            setSearchValue('')
          }}
        />
      )
    }
  ]

  const handleLoginOk = () => {
    setLoginModalOpen(false);
  };

  const handleLoginCancel = () => {
    setLoginModalOpen(false);
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSearchOpen(true);
  };
  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setSearchOpen(nextOpen);
    }
  };
  const [messageApi, contextHolder] = message.useMessage();
  const search = (value: string) => {
    if (value.trim()) {
      value = encodeURIComponent(value);
      router.push(`/search/${value}/hybrid`);
    }
  };

  return (
    <Header className="flex items-center justify-between" style={{ backgroundColor: "#1A2B5C", height: "64px", paddingLeft: "10px", paddingRight: "10px" }}>
      {contextHolder}
      <Modal open={loginModalOpen} onOk={handleLoginOk} onCancel={handleLoginCancel} footer={null}>
        <LoginModal type={type} setType={setType} setIsModalOpen={setLoginModalOpen} ></LoginModal>
      </Modal>
      <SiderDrawer
        user={user}
        isDrawerOpen={drawerOpen}
        setIsDrawerOpen={setDrawerOpen}
        setUtilsType={setUtilsType}
        setUserModalOpen={setUserModalOpen}
        setUser={setUser}
        messageApi={messageApi}
      />
      <UserPasswordModal
        utilsType={utilsType}
        setUtilsType={setUtilsType}
        userModalOpen={userModalOpen}
        messageApi={messageApi}
        setUserModalOpen={setUserModalOpen}
      />

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
          ) : icon.text === "管理" ? (
            user && user.privilege == 2 && (
              <NavItem key={index} href={icon.href} text={icon.text} />
            )
          ) :
            (<NavItem key={index} href={icon.href} text={icon.text} />)
        ))}
      </Flex>

      <Flex justify="end" className='h-full text-white flex items-center'>
        <Space wrap size={8}>
          <Dropdown
            arrow
            menu={{ items: searchItems, onClick: handleMenuClick }}
            placement="bottomRight"
            trigger={['click']}
            open={searchOpen}
            onOpenChange={handleOpenChange}
          >
            <div className='h-full'>
              <SearchOutlined style={{
                color: "#DAA520",
                fontSize: "20px",
                paddingRight: "5px"
              }}
              />
            </div>
          </Dropdown>
          {!user ? (<>
            <div className="cursor-pointer"
              onClick={() => {
                setType('account');
                setLoginModalOpen(true)
              }}>
              登录
            </div>
            <div className="h-5 border-l-2 border-white" />
            <div className="cursor-pointer"
              onClick={() => {
                setType('register');
                setLoginModalOpen(true)
              }}>
              注册
            </div>
          </>) : null
          }
          <UserAvatar user={user} onClick={() => setDrawerOpen(true)} />
        </Space>
      </Flex>
    </Header >
  );
}
