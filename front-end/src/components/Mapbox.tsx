import React from 'react'

export default function Mapbox() {
  return (
    <div className="w-auto h-[95%]">
      <iframe src="/map.html" className="w-full h-full" style={{ border: 'none' }}></iframe>
    </div>
  )
}
