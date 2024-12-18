"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Person, searchIndividuals } from '@/lib/individual';
import { ProTable } from '@ant-design/pro-components';
import Link from 'next/link';
import IndividualListItem from '@/components/list_item/IndividualListItem';

export default function Page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }


  const [individuals, setIndividuals] = useState<Person[]>([]);

  useEffect(() => {
    searchIndividuals(slug).then(setIndividuals);
  }, [slug]);

  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProTable
        dataSource={individuals}
        rowKey="id"
        headerTitle="人物搜索结果"
        search={false}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          defaultPageSize: 20,
        }}
        columns={[
          {
            title: '姓名',
            dataIndex: 'name',
            render: (text, record) => (
              <IndividualListItem record={record} showTag={false} paddingLeft={false} />
            ),
          },
        ]}
      />
    </div>
  );
}