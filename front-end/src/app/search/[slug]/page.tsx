"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const slug = params.slug;
  useEffect(() => {
    router.push(`/search/${slug}/hybrid`);
  }, [router]);

  return null;
}
