'use client'
import React from 'react'
import { getAllIndividuals, Person } from '@/lib/individual'
import { useRouter } from 'next/navigation';
import { ProList } from '@ant-design/pro-components';

export default function page() {
  const router = useRouter();
  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProList< Person>
        rowKey="name"
        headerTitle="人物列表"
        request={async (params = {}) => {
          const { current: page, pageSize, title } = params;
          const res = await getAllIndividuals({ page, pageSize, title });
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
    </div >
  )
}
