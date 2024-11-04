import React from 'react'

// 传入id
export default function Mapbox({ id }: { id: number }) {
  const deploy = process.env.REACT_APP_DEPLOY === 'true' ? 'true' : 'false'
  return (
    <div className="w-auto h-[95%]">
      <iframe src={`/map.html?id=${id}&deploy=${deploy}`} className="w-full h-full" style={{ border: 'none' }}></iframe>
    </div>
  )
}