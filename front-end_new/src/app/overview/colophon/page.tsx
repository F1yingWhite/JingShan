'use client';
import { getColophonList, getColophonTotalNum } from '@/lib/colophon';
import React from 'react';
import DataTable from '@/components/DataTable'; // 确保路径正确
import { Colophon } from '@/lib/colophon';

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: "10%"
  },
  {
    title: "经名",
    dataIndex: "scripture_name",
    key: "scripture_name"
  },
  {
    title: "卷数",
    dataIndex: "volume_id",
    key: "volume_id"
  },
  {
    title: "册数",
    dataIndex: "chapter_id",
    key: "chapter_id"
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
    width: "50%",
    ellipsis: true,
  },
  {
    title: "千字文",
    dataIndex: "qianziwen",
    key: "qianziwen"
  }
];

export default function Page() {
  return (
    <DataTable<Colophon>
      columns={columns}
      getList={getColophonList}
      getTotalNum={getColophonTotalNum}
    />
  );
}
