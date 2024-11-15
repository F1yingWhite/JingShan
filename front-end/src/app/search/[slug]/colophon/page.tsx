'use client'
import { searchColophon, ContentItem, Colophon } from '@/lib/colophon';
import { ProList } from '@ant-design/pro-components';
import { Badge, Collapse } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import ColophonListItem from '@/components/list_item/ColophonListItem';
export default function Page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  const router = useRouter();
  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProList<ContentItem>
        rowKey="name"
        headerTitle="经文列表"
        request={async (params = {}) => {
          const { current = 1, pageSize = 10 } = params;
          const { data, total, success } = await searchColophon(slug, current, pageSize);
          return {
            data: data.content,
            total: total,
          };
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        metas={{
          title: {
            render: (text, record) => (
              <ColophonListItem record={record} showTag={false} router={router} slug={decodeURI(slug)} />
            ),
          },
          description: {
            render: () => null,
          },
        }}
      />
    </div>
  );
}
