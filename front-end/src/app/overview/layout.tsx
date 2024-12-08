'use client'
import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import ChatButton from '@/components/ChatButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout className="h-full">
      <Content className="p-6">
        <div className='hidden md:block'>
          <ChatButton />
        </div>
        {children}
      </Content>
    </Layout>
  );
}