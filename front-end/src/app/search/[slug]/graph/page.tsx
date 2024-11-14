'use client'
import React, { useEffect, useState } from 'react'
import { getGraphList, getIdentityList, GraphDetail } from '@/lib/graph'
import { ProList } from '@ant-design/pro-components'
import { Collapse, Space, Tag } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { getRandomColor } from '@/utils/randomColor';
export default function page() {
  let { slug } = useParams();
  const [colorMap, setColorMap] = useState({})
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  const decodedSlug = decodeURIComponent(slug);
  const router = useRouter();
  useEffect(() => {
    getIdentityList().then(res => {
      const map = {};
      res.forEach(item => {
        map[item] = getRandomColor();
      });
      setColorMap(map);
    });
  }, []);


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
                      key: record.姓名,
                      label: <span className="text-[#c19d50]" onClick={() => { router.push(`/graph/${encodeURIComponent(record.姓名)}`) }}>{record.姓名} {record.身份 && <Space size={0}>
                        <Tag color={colorMap[record.身份]}>{record.身份}</Tag>
                      </Space>}</span>,
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
