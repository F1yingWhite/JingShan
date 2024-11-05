'use client'
import React from 'react'
import { getGraphList, GraphDetail } from '@/lib/graph'
import { ProList } from '@ant-design/pro-components'
import { Collapse } from 'antd';
import { useParams, useRouter } from 'next/navigation';
export default function page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  const decodedSlug = decodeURIComponent(slug);
  const router = useRouter();
  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProList< GraphDetail>
        rowKey="name"
        headerTitle="人物列表"
        request={async (params = {}) => {
          const { current, pageSize } = params;
          const res = await getGraphList({ current, pageSize, title: decodedSlug });
          return {
            data: res.data.data,
            total: res.data.total,
          };
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        metas={{
          title: {
            title: "人物名称",
            render: (text, record) => {
              // 如果record有除了姓名的其他字段则展示Collapse,否则只展示姓名
              const hasOtherFields = Object.keys(record).some(key => key !== '姓名');
              return hasOtherFields ? (
                <Collapse
                  ghost
                  items={[
                    {
                      key: record.name,
                      label: <span className="text-[#c19d50]" onClick={() => { router.push(`/graph/${encodeURIComponent(record.姓名)}`) }}>{record.姓名}</span>,
                      children: (
                        <div>
                          <ul>
                            {Object.keys(record).map((key) => {
                              if (key !== '姓名') {
                                return (
                                  <li key={key}>
                                    <span className="text-[#c19d50]">{key}</span>: {record[key]}
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </ul>
                        </div>
                      ),
                    },
                  ]}
                />
              ) : (
                <span className="text-[#c19d50] ml-10" onClick={() => { router.push(`/graph/${encodeURIComponent(record.姓名)}`) }}>{record.姓名}</span>
              );
            },
          },
        }}
      />
    </div >
  )
}
