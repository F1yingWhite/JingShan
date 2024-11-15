import { Collapse, Tag, Badge } from 'antd'
import React from 'react'
import { colorMap } from '@/utils/getColor';
import { ContentItem, Colophon } from '@/lib/colophon';
import { highlightText } from '@/utils/highlightText';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface ContentItemProps {
  record: ContentItem;
  showTag: boolean;
  slug: string;
  router: AppRouterInstance;
}


export default function ColophonListItem({ record, showTag, slug, router }: ContentItemProps) {
  return (
    <Collapse
      ghost
      items={[
        {
          key: record.name,
          label: (
            <span className="text-[#c19d50]">
              {record.name + " "}
              {showTag && (
                <Tag color={colorMap["牌记"]}>牌记</Tag>
              )}
              <Badge count={record.related_data.length} style={{ marginInlineStart: 4 }} />
            </span>
          ),
          children: (
            <div>
              {record.related_data.map((colophon: Colophon) => (
                <div key={colophon.id} className="mb-4 p-3 bg-[#f3f1eb] rounded-md"
                  onClick={
                    () => router.push(`/colophon/${colophon.id}`)
                  }
                >
                  <p className="font-bold">经文名: {colophon.scripture_name}</p>
                  <p>{highlightText(colophon.content, slug)}</p>
                </div>
              ))}
            </div>
          ),
        },
      ]}
    />

  )
}
