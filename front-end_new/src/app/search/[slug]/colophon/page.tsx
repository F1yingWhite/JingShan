'use client';

import { searchColophon, ContentItem, Colophon } from '@/lib/colophon';
import { ProList } from '@ant-design/pro-components';
import { Badge, Collapse } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  const renderBadge = (count: number) => (
    <Badge count={count} style={{ marginInlineStart: 4 }} />
  );


  return (
    <div className="h-full overflow-y-auto">
      <ProList<ContentItem>
        rowKey="name"
        headerTitle="经文列表"
        request={async (params = {}) => {
          const { current = 1, pageSize = 10 } = params;
          const { data, total, success } = await searchColophon(slug, current, pageSize);
          console.log(data);
          return {
            data: data.content,
            total: total,
          };
        }}
        pagination={{
          // 设置页面大小是5,10,20,默认是5
          pageSizeOptions: ['5', '10', '20'],
          defaultPageSize: 5,
        }}
        metas={{
          title: {
            render: (text, record) => (
              <Collapse
                ghost
                items={[
                  {
                    key: record.name,
                    label: <span className="text-[#c19d50]">{record.name}{renderBadge(record.related_data.length)}</span>,
                    children: (
                      <div>
                        {record.related_data.map((colophon: Colophon) => (
                          <div key={colophon.id} className="mb-4 p-3 bg-[#f3f1eb] rounded-md">
                            <p className="font-bold">经文名: {colophon.scripture_name}</p>
                            <p>内容: {colophon.content}</p>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
            ),
          },
          description: {
            render: () => null,
          },
        }}
      />
    </div>
  );
}
