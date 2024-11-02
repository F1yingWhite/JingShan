'use client';
import React from 'react';
import { getStoryList, getStoryTotalNum } from '@/lib/story';
import { Story } from '@/lib/story';
import DataTable from '@/components/DataTable'; // 确保路径正确

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: "10%"
  },
  {
    title: "故事名称",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "故事内容",
    dataIndex: "content",
    key: "content",
    width: "60%",
    ellipsis: true,
  },
];

export default function Page() {
  return (
    <DataTable<Story>
      columns={columns}
      getList={getStoryList}
      getTotalNum={getStoryTotalNum}
    />
  );
}
