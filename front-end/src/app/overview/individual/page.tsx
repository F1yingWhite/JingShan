'use client'
import React from 'react'
import { getAllIndividuals, Person } from '@/lib/individual'
import { useRouter } from 'next/navigation';

export default function page() {
  const router = useRouter();
  return (
    <div className='flex flex-row w-full h-[100vh] overflow-auto p-6'>
      <div className='w-1/4 bg-pink-100 h-full flex flex-col '>
      <span className='text-[#1A2B5C]'>精确筛选</span>
      <div className='h-px bg-gray-400 my-4'></div>
      </div>
      <div className='w-3/4 bg-blue-200 h-full'></div>
    </div >
  )
}
