'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/RelationChart'
import { Graph, getAllGraph } from '@/lib/graph_zhi';
import { Tabs } from 'antd';

export default function Page() {
  const [graph, setGraph] = useState<Graph>()

  useEffect(() => {
    getAllGraph().then(graph => {
      setGraph(graph);
    });
  }, []);

  return (
    <Tabs className='w-full h-full overflow-x-hidden overflow-y-auto' defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: <div className="text-2xl font-bold text-center my-4 text-[#c19d50]">人物关系图</div>,
          children: (
            <div>
              <div className='h-screen w-screen'>
                <RelationChart graph={graph} layout={'force'} emphasis={true} zoom={0.1} />
              </div>
            </div>
          )
        },
        {
          key: '2',
          label: <div className="text-2xl font-bold text-center my-4 text-[#c19d50]">牌记图谱</div>,
          children: (
            <div>
              <div className='h-screen w-screen'>
                <RelationChart graph={graph} layout={'force'} emphasis={true} zoom={0.1} />
              </div>
            </div>
          )
        }
      ]
      }
    />
  )
}