'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/RelationChart'
import { Graph, getGraph } from '@/lib/graph';



export default function page({ params }: { params: { slug: string } }) {
  const [graph, setGraph] = useState<Graph>()
  const slug = params.slug;
  useEffect(() => {
    getGraph(slug).then(res => {
      setGraph(res);
    },)
  }, [setGraph])
  return (
    <>
      {graph && <RelationChart graph={graph} />}
    </>
  )
}
