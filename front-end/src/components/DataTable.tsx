'use client';
import React, { SetStateAction } from 'react';
import ProTable from '@ant-design/pro-table';

interface TableProps<T extends Record<string, any>> {
  columns: any[];
  getList: (page: number, pageSize: number, params: any) => Promise<T>;
  setAdCount?: SetStateAction<any>;
}


const DataTable = <T extends Record<string, any>>({ columns, getList, setAdCount }: TableProps<T>) => {
  const fetchData = async (params: any) => {
    const { current, pageSize, ...rest } = params;
    try {
      const res = await getList(current, pageSize, rest);
      if (setAdCount) {
        setAdCount({ ad: res.data.ad, count: res.data.count });
      }
      return {
        data: res.data.data,
        total: res.data.total_num,
        success: true,
      };
    } catch (err) {
      console.error(err);
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  return (
    <ProTable<T>
      bordered
      columns={columns}
      search={{
        showHiddenNum: true,
        defaultCollapsed: false,
        className: "bg-[#f3f1ea]",
      }}
      request={fetchData}
      pagination={{
        showSizeChanger: true,
        pageSizeOptions: [5, 10, 20, 50],
        defaultPageSize: 20,
      }}
      rowKey="id"
    />
  );
};

export default DataTable;
