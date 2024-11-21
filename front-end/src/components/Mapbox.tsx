import React from 'react'

// 传入id
export default function Mapbox({ id }: { id: number }) {
  return (
    <iframe src={`/map.html?id=${id}`} className="w-full h-full" style={{ border: 'none' }}></iframe>
  )
}