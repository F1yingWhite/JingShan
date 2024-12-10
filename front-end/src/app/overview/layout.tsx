'use client'
import { Breadcrumb, Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import ChatButton from '@/components/ChatButton';
import { usePathname } from 'next/navigation';

const path_map = {
  "overview": "文库",
  "preface_and_postscript": "径山藏/序跋",
  "colophon": "径山藏/牌记",
  "individual": "径山藏/人物",
  "graph": "径山藏",
  "story": "径山藏/故事",
};

const getBreadcrumbs = (pathname) => {
  return pathname.split('/').filter(item => item).flatMap((item, index, arr) => {
    let breadcrumbName = path_map[item] || item.charAt(0).toUpperCase() + item.slice(1);
    if (breadcrumbName.includes('/')) {
      return breadcrumbName.split('/').map((namePart, partIndex, parts) => ({
        path: `/${arr.slice(0, index + 1).join('/')}${partIndex > 0 ? `/${parts.slice(0, partIndex + 1).join('/')}` : ''}`,
        breadcrumbName: namePart,
      }));
    } else {
      return [{
        path: `/${arr.slice(0, index + 1).join('/')}`,
        breadcrumbName,
      }];
    }
  });
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  return (
    <div className="h-full">
      <div className="p-6 max-w-[1200px] mx-auto w-full">
        <div className='hidden md:block'>
          <ChatButton />
        </div>
        <div className='mb-4 w-full'>
          <Breadcrumb separator={<div className='text-lg'>&gt;&gt;</div>}>
            {breadcrumbs.map(({ path, breadcrumbName }, index) => (
              <Breadcrumb.Item key={index} className='text-lg'>
                {breadcrumbName}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          {children}
        </div>
      </div>
    </div>
  );
}