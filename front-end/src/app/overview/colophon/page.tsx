'use client';
import { ColophonADCount, getColophonADCount, getColophonList } from '@/lib/colophon';
import React, { useEffect } from 'react';
import DataTable from '@/components/DataTable'; // 确保路径正确
import { Colophon } from '@/lib/colophon';
import Link from 'next/link';
import TimeChart from '@/components/charts/TimeChart';

const columns = [
  {
    title: "经名",
    dataIndex: "scripture_name",
    key: "scripture_name",
    render: (text: any, record: any) => (
      <Link className="text-[#c19d50]" href={`/graph/scripture/${record.scripture_name}`}>{record.scripture_name}</Link>
    ),
  },
  {
    title: "册数",
    dataIndex: "chapter_id",
    key: "chapter_id",
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
    width: "50%",
    render: (text: any, record: any) => (
      <Link className="text-[#c19d50]" href={`/colophon/${record.id}`}>{record.content}</Link>
    ),
    ellipsis: true,
  },
  {
    title: "千字文",
    dataIndex: "qianziwen",
    key: "qianziwen"
  },
  {
    title: "开始时间",
    key: "start_time",
    hideInTable: true,
  },
  {
    title: "结束时间",
    key: "end_time",
    hideInTable: true,
  }
];

export default function Page() {
  const [adCount, setAdCount] = React.useState<ColophonADCount>({ ad: [], count: [] });

  return (
    <div>
      <div className='h-[50vh] min-h-[500px] p-8'>
        {
          adCount &&
          <TimeChart
            title='牌记出现时间统计图'
            x_title='年份'
            y_title='出现次数'
            x_data={adCount.ad}
            y_data={adCount.count}
          />
        }
      </div>
      <DataTable<Colophon>
        columns={columns}
        setAdCount={setAdCount}
        getList={getColophonList}
      />
    </div>
  );
}
