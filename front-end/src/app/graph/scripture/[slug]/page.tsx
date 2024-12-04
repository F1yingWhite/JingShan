'use client'
import RelationChart from '@/components/RelationChart'
import { Graph } from '@/lib/graph_zhi'
import React, { useEffect, useState } from 'react'
import { getByScriptureName } from '@/lib/graph_zang'
import { Slider, Spin } from 'antd';

export default function page({ params }: { params: { slug: string } }) {
  const [graph, setGraph] = useState<Graph>();
  const slug = decodeURIComponent(params.slug);
  const [begin, setBegin] = useState(0);
  const [len, setLen] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getByScriptureName(slug, begin, len).then(graph => {
      if (graph.graph) {
        setGraph(graph.graph);
      }
      setTotal(graph.total);
      setLoading(false);
    });
  }, []);

  function onChangeComplete(value: number[]): void {
    if (value[1] - value[0] > 100) {
      return;
    }
    setLoading(true);
    setBegin(value[0])
    setLen(value[1] - value[0])
    getByScriptureName(slug, value[0], value[1] - value[0]).then(graph => {
      if (graph.graph) {
        setGraph(graph.graph);
      }
      setLoading(false);
    });
  }

  return (
    <div className='w-full h-full overflow-y-auto'>
      <Spin spinning={loading} fullscreen />
      <div className="text-2xl font-bold text-center my-4 text-[#c19d50]">牌记关系图</div>
      <div className="flex h-[100vh] items-center justify-center">
        <div className='h-[50vh] flex flex-col items-center'>
          <div className="text-center mb-2 flex flex-col justify-center items-center text-[#c19d50]">
            <span>卷</span>
            <span>数</span>
            <span>范</span>
            <span>围</span>
          </div>

          <Slider
            range
            max={total}
            min={0}
            step={10}
            vertical
            defaultValue={[0, Math.max(total, 50)]}
            onChangeComplete={onChangeComplete}
          />
        </div>
        <div className="flex-1 h-[100vh]">
          <RelationChart graph={graph} layout='none' emphasis={true} zoom={1} />
        </div>
      </div>
    </div>
  )
}
