'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/RelationChart'
import { Graph, getAllGraph } from '@/lib/graph_zhi';
import { Tabs } from 'antd';

export default function Page() {
  const [individualGraph, setIndividualGraph] = useState<Graph>()

  useEffect(() => {
    getAllGraph().then(graph => {
      setIndividualGraph(graph);
    });
  }, []);

  return (
    <Tabs className='w-full h-full overflow-x-hidden overflow-y-auto'
      centered
      defaultActiveKey="1"
      onChange={(activateKey: string) => {
        if (activateKey === '1') {
          setIndividualGraph(undefined);
          getAllGraph().then(graph => {
            setIndividualGraph(graph);
          });
        }
      }}
      items={[
        {
          key: '1',
          label: <div className="text-2xl font-bold text-center my-4 text-[#c19d50]">人物关系图</div>,
          children: (
            <div>
              <div className='h-screen w-screen'>
                {
                  individualGraph &&
                  <RelationChart graph={individualGraph} layout={'force'} emphasis={true} zoom={0.1} />
                }
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
                <RelationChart graph={individualGraph} layout={'force'} emphasis={true} zoom={0.1} />
              </div>
            </div>
          )
        }
      ]
      }
    />
  )
}