'use client'
import React, { useEffect, useState } from 'react'
import { getGraphList, getIdentityList, GraphDetail } from '@/lib/graph_zhi'
import { ProList } from '@ant-design/pro-components'
import { Collapse, Space, Tag } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { identityColorList } from '@/utils/getColor';
import GraphListItem from '@/components/list_item/GraphListItem';
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
      res.forEach((item, index) => {
        map[item] = identityColorList[index % identityColorList.length];
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
              return <GraphListItem showTag={false} record={record} router={router} graph_colorMap={colorMap} />
            },
          },
        }}
      />
    </div >
  )
}
