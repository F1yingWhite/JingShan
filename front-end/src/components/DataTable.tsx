'use client';
import React from 'react';
import ProTable from '@ant-design/pro-table';

interface TableProps<T extends Record<string, any>> {
  columns: any[];
  getList: (page: number, pageSize: number, params: any) => Promise<T>;
}


const DataTable = <T extends Record<string, any>>({ columns, getList }: TableProps<T>) => {
  const fetchData = async (params: any) => {
    const { current, pageSize, ...rest } = params;
    try {
      const res = await getList(current, pageSize, rest);
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
