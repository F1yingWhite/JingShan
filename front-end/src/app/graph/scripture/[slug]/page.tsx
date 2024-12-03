'use client'
import RelationChart from '@/components/RelationChart'
import { Graph } from '@/lib/graph_zhi'
import React, { useEffect, useState } from 'react'
import { getByScriptureName } from '@/lib/graph_zang'

export default function page({ params }: { params: { slug: string } }) {
  const [graph, setGraph] = useState<Graph>();
  const slug = decodeURIComponent(params.slug);

  useEffect(() => {
    getByScriptureName(slug).then(graph => {
      if (graph) {
        setGraph(graph);
      }
    });
  }, []);

  return (
    <div className='w-full h-full overflow-y-auto'>
      <div className="text-2xl font-bold text-center my-4 text-[#c19d50]">牌记关系图</div>
      <div className="h-2/3"><RelationChart graph={graph} layout='none' emphasis={true} zoom={1}/></div>
    </div>
  )
}
