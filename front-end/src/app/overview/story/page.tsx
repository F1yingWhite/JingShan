'use client';
import React from 'react';
import { getStoryList  } from '@/lib/story';
import { Story } from '@/lib/story';
import DataTable from '@/components/DataTable'; // 确保路径正确
import Link from 'next/link';

const columns = [
  {
    title: "故事名称",
    dataIndex: "title",
    key: "title",
    render: (text: any, record: any) => (
      <Link className="text-[#c19d50]" href={`/story/${record.id}`}>{record.title}</Link>
    ),
  },
  {
    title: "故事内容",
    dataIndex: "content",
    key: "content",
    width: "80%",
    ellipsis: true,
  },
];

export default function Page() {
  return (
    <DataTable<Story>
      columns={columns}
      getList={getStoryList}
    />
  );
}
