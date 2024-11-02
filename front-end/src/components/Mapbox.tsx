import React from 'react'
// 传入id
export default function Mapbox({ id }: { id: number }) {
  return (
    <div className="w-auto h-[95%]">
      <iframe src={`/map.html?id=${id}`} className="w-full h-full" style={{ border: 'none' }}></iframe>
    </div>
  )
}
