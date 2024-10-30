'use client';
import { getColophonList, getColophonPageNum } from '@/lib/colophon';
import React, { useEffect, useState } from 'react';
import { Colophon } from '@/lib/colophon';
import { Table } from 'antd';

const columns = [
  {
    title: "序号",
    dataIndex: "id",
    key: "id"
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content"
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
    title: "千字文",
    dataIndex: "qianziwen",
    key: "qianziwen"
  }
];

export default function Page() {
  const [colophon, setColophon] = useState<Colophon[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchColophonData = async (page: number, size: number) => {
    try {
      const res = await getColophonList(page, size);
      setColophon(res);
      const total = await getColophonPageNum(size);
      setPageNum(total);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchColophonData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Table<Colophon>
      bordered
      columns={columns}
      dataSource={colophon}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: pageNum,
        showSizeChanger: true, // 允许用户改变页面大小
        pageSizeOptions: [10, 20, 50], // 页面大小选项
      }}
      onChange={handleTableChange}
    />
  );
}
