'use client'
import { searchColophon, ContentItem, Colophon } from '@/lib/colophon';
import { ProList } from '@ant-design/pro-components';
import { Badge, Collapse } from 'antd';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  const renderBadge = (count: number) => (
    <Badge count={count} style={{ marginInlineStart: 4 }} />
  );
  const router = useRouter();
  const highlightText = (text: string, highlight: string) => {
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className='text-[#c19d50]'>{part}</span>
      ) : (
        part
      )
    );
  };

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
          pageSizeOptions: ['5', '10', '20'],
          defaultPageSize: 5,
        }}
        metas={{
          title: {
            render: (text, record) => (
              <Collapse
                ghost
                items={[
                  {
                    key: record.name,
                    label: <span className="text-[#c19d50]">{record.name}{renderBadge(record.related_data.length)}</span>,
                    children: (
                      <div>
                        {record.related_data.map((colophon: Colophon) => (
                          <div key={colophon.id} className="mb-4 p-3 bg-[#f3f1eb] rounded-md" onClick={() => router.push(`/colophon/${colophon.id}`)}>
                            <p className="font-bold">经文名: {colophon.scripture_name}</p>
                            <p>{highlightText(colophon.content, decodeURIComponent(slug))}</p>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
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
