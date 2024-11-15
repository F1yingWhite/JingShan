'use client'
import React, { useEffect, useState } from 'react'
import { getGraphList, getIdentityList, GraphDetail } from '@/lib/graph'
import { ProList } from '@ant-design/pro-components'
import { useRouter } from 'next/navigation';
import GraphListItem from '@/components/list_item/GraphListItem';
import { identityColorList } from '@/utils/getColor';
export default function page() {
  const router = useRouter();

  const [colorMap, setColorMap] = useState({})
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
          const res = await getGraphList(params);
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
              return <GraphListItem record={record} showTag={false} router={router} graph_colorMap={colorMap} />
            },
          },
        }}
      />
    </div >
  )
}
