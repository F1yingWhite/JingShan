"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  return null;
}
