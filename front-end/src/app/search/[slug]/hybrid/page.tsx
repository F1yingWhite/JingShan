'use client'
import { searchHybrid } from '@/lib/hybrid';
import { ProList } from '@ant-design/pro-components';
import { Collapse } from 'antd';
import { useParams } from 'next/navigation';
import React from 'react'

export default function page() {
  const colorMap = {
    "人物": "red",
    "序跋": "blue",
    "牌记": "green",
    "径山志": "yellow",
  }

  let { slug } = useParams();

  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProList
        rowKey="name"
        headerTitle="经文列表"
        request={async (params = {}) => {
          const { current = 1, pageSize = 10 } = params;
          const { data, total, success } = await searchHybrid(slug, current, pageSize);
          return {
            data: data.content,
            total: total,
          };
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        metas={{
          title: {
            render: (text, record) => (
              <div />
            ),
          },
          description: {
            render: () => null,
          },
        }}
      />
    </div>
  )
}
