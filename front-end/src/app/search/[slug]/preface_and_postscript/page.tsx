"use client";

import { useParams } from 'next/navigation';
import { ProTable } from '@ant-design/pro-components';
import { searchPrefaceAndPostscript } from '@/lib/preface_and_postscript';
import Link from 'next/link';
export default function Page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }

  const request = async (params: { current: number; pageSize: number }) => {
    const { current, pageSize } = params;

    const response = await searchPrefaceAndPostscript(slug, current, pageSize);

    return {
      data: response.data,
      success: response.success,
      total: response.total,
    };
  };

  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProTable
        rowKey="id"
        headerTitle="序跋搜索结果"
        request={request}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        search={false}
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
              <Link className="text-[#c19d50]" href={`/preface_and_postscript/${record.id}`}>{text}</Link>
            ),
          },
          {
            title: '朝代',
            dataIndex: 'dynasty',
            key: 'dynasty',
          },
          {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
            render: (text) => {
              return typeof text === 'string' && text.endsWith('撰') ? text.slice(0, -1) : text;
            },
          },
          {
            title: '翻译者',
            dataIndex: 'translator',
            key: 'translator',
          },
          {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
          },
          {
            title: '经典',
            dataIndex: 'classic',
            key: 'classic',
          },
        ]}
      />
    </div>
  );
}
