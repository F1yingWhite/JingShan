"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const keyword = new URLSearchParams(window.location.search).get('keyword');
  useEffect(() => {
    router.push(`/search?keyword=${keyword}`);
  }, [router]);

  return null;
}
