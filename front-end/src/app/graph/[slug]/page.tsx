'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/RelationChart'
import { Graph, getGraph, getGraphDetailByName, GraphDetail, GraphLists, getIdentityList } from '@/lib/graph';
import { ProList } from '@ant-design/pro-components';
import { Collapse, Space, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { identityColorList } from '@/utils/getColor';
import GraphListItem from '@/components/list_item/GraphListItem';
export default function page({ params }: { params: { slug: string } }) {
  const [graph, setGraph] = useState<Graph>()
  const [graphDetail, setGraphDetail] = useState<GraphLists>()
  const slug = decodeURIComponent(params.slug);
  const [colorMap, setColorMap] = useState({})

  useEffect(() => {
    getGraph(slug).then(graph => {
      setGraph(graph);
      if (graph) {
        const fetchGraphDetails = async () => {
          const details = [];
          for (const node of graph.nodes) {
            const res = await getGraphDetailByName(node.name);
            details.push(res[0]);
          }
          setGraphDetail(details);
        };
        fetchGraphDetails();
      }
    });
  }, [slug]);

  useEffect(() => {
    getIdentityList().then(res => {
      const map = {};
      res.forEach((item, index) => {
        map[item] = identityColorList[index % identityColorList.length];
      });
      setColorMap(map);
    });
  }, []);

  const router = useRouter();
  return (
    <div className='w-full h-full overflow-y-auto'>
      <div className="text-2xl font-bold text-center my-4 text-[#c19d50]">人物关系图</div>
      {graph && <div className="h-2/3"><RelationChart graph={graph} /></div>}
      <ProList< GraphDetail>
        rowKey="name"
        headerTitle="人物列表"
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        dataSource={graphDetail}
        metas={{
          title: {
            title: "人物名称",
            render: (text, record) => {
              return <GraphListItem showTag={false} record={record} router={router} />
            },
          },
        }}
      />
    </div>
  )
}
