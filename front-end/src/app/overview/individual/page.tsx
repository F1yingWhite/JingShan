'use client'
import React from 'react'
import { getAllIndividuals, Person } from '@/lib/individual'
import { useRouter } from 'next/navigation';
import { ProList } from '@ant-design/pro-components';

export default function page() {
  const router = useRouter();
  return (
    <ProList< Person>
      rowKey="name"
      headerTitle="人物列表"
      request={async (params = {}) => {
        let { current, pageSize, title } = params;
        if (title === undefined) {
          title = '';
        }
        const res = await getAllIndividuals(current, pageSize, title);
        return {
          data: res.data.data,
          total: res.data.total,
        };
      }}
      search={{
        filterType: 'light',
      }}
      pagination={{
        pageSizeOptions: ['5', '10', '20', '50'],
        defaultPageSize: 20,
      }}
      metas={{
        title: {
          search: true,
          title: "人物名称",
          render: (text, record) => {
            return <span className="text-[#c19d50]" onClick={() => { router.push(`/individual/${encodeURIComponent(record.id)}`) }}>{record.name}</span>
          },
        },
      }}
    />
  )
}
