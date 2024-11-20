'use client';
import { getPrefaceAndPostscriptList, getcPrefaceAndPostscriptTotalNum } from '@/lib/preface_and_postscript';
import { PrefaceAndPostscript } from '@/lib/preface_and_postscript';
import React from 'react';
import DataTable from '@/components/DataTable'; // 确保路径正确
import Link from 'next/link';

const columns = [
  {
    title: "典籍",
    dataIndex: "classic",
    key: "classic",
    width: "20%",
  },
  {
    title: "经译者",
    dataIndex: "translator",
    key: "translator",
    width: "20%",
  },
  {
    title: "序跋篇名",
    dataIndex: "title",
    key: "title",
    width: "20%",
    render: (text: any, record: any) => (
      <Link className="text-[#c19d50]" href={`/preface_and_postscript/${record.id}`}>{record.title}</Link>
    ),
  },
  {
    title: "类别",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "朝代",
    dataIndex: "dynasty",
    key: "dynasty",
  },
  {
    title: "作者",
    dataIndex: "author",
    key: "author",
    width: "20%",
  },
  // {
  //   title: "册",
  //   dataIndex: "copy_id",
  //   key: "copy_id",
  // },
  // {
  //   title: "页",
  //   dataIndex: "page_id",
  //   key: "page_id",
  // }
];

export default function Page() {
  return (
    <DataTable<PrefaceAndPostscript>
      columns={columns}
      getList={getPrefaceAndPostscriptList}
      getTotalNum={getcPrefaceAndPostscriptTotalNum}
    />
  );
}
