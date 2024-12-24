'use client'
import React, { useEffect, useState } from 'react'
import { getGraphList, getIdentityList, GraphDetail } from '@/lib/graph_zhi'
import { ProList } from '@ant-design/pro-components'
import { useRouter } from 'next/navigation';
import GraphListItem from '@/components/list_item/GraphListItem';
import { identityColorList } from '@/utils/getColor';
import { Select } from 'antd';
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
    <div className="h-full overflow-hidden rounded-md">
      <div className='mt-8'></div>
      <ProList< GraphDetail>
        rowKey="name"
        headerTitle="人物列表"
        request={async (params = { role: "全部", }) => {
          const res = await getGraphList(params);
          return {
            data: res.data.data,
            total: res.data.total,
          };
        }}
        search={{
          showHiddenNum: true,
          defaultCollapsed: false,
          // className: "bg-[#f3f1ea]",
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        showActions="hover"
        metas={{
          title: {
            search: true,
            title: "人物名称",
            render: (text, record) => {
              return <GraphListItem record={record} showTag={false} router={router} graph_colorMap={colorMap} />
            },
          },
          role: {
            title: '身份',
            valueType: 'select',
            valueEnum: {
              全部: { text: '全部' },
              法侣: { text: '法侣' },
              列祖: { text: '列祖' },
              住持: { text: '住持' },
              外户: { text: '外户' },
            },
          },
          dynasty: {
            title: '朝代',
            valueType: 'select',
            valueEnum: {
              唐: { text: '唐' },
              五代十国: { text: '五代十国' },
              宋: { text: '宋' },
              元: { text: '元' },
              明: { text: '明' },
              清: { text: '清' },
            },
          },
        }}
      />
    </div >
  )
}
