'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/RelationChart'
import { Graph, getAllGraph } from '@/lib/graph';

export default function Page() {
  const [graph, setGraph] = useState<Graph>()

  useEffect(() => {
    getAllGraph().then(graph => {
      setGraph(graph);
    });
  }, []);

  return (
    <div className='w-full h-full overflow-y-auto'>
      <RelationChart graph={graph} layout={'force'} />
    </div>
  )
}