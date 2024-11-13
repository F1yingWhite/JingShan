'use client'
import React from 'react'
import Live2d from '@/components/live2d'

export default function Page() {
  return (
    <div className='w-full h-full'>
      <div
        className='fixed bottom-3 right-0'
        style={{
          width: '50vw',
          height: '50vw',
          maxWidth: '50vh',
          maxHeight: '50vh',
        }}
      >
        <Live2d />
      </div>
    </div>
  )
}