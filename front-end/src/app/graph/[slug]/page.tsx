'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/RelationChart'
import { Graph, getGraph, getGraphDetailByName, GraphDetail, GraphLists, getIdentityList } from '@/lib/graph';
import { ProList } from '@ant-design/pro-components';
import { Collapse, Space, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { getRandomColor } from '@/utils/randomColor';
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
      res.forEach(item => {
        map[item] = getRandomColor();
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
    </div>
  )
}
