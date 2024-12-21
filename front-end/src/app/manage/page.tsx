'use client'
import { useUserStore } from '@/store/useStore'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.privilege !== 2) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div>
      这是管理页面
    </div>
  )
}