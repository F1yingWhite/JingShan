'use client';
import React from 'react';
import ProTable from '@ant-design/pro-table';

interface TableProps<T extends Record<string, any>> {
  columns: any[];
  getList: (page: number, pageSize: number, params: any) => Promise<any>;
  getTotalNum: (params: any) => Promise<any>;
}

const DataTable = <T extends Record<string, any>>({ columns, getList, getTotalNum }: TableProps<T>) => {
  const fetchData = async (params: any) => {
    const { current, pageSize, ...rest } = params;
    try {
      const res = await getList(current, pageSize, rest);
      const total = await getTotalNum(rest);
      return {
        data: res.data,
        total: total.data.total_num,
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
    <div className='overflow-auto h-full'>
      <ProTable<T>
        bordered
        columns={columns}
        request={fetchData}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        rowKey="id"
      />
    </div>
  );
};

export default DataTable;
