import { PrefaceAndPostscript, PrefaceAndPostscriptClassic } from '@/lib/preface_and_postscript';
import { colorMap } from '@/utils/getColor'
import { highlightText } from '@/utils/highlightText';
import { Badge, Collapse, Tag } from 'antd'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import React from 'react'

interface PrefaceAndPostscriptListItemProps {
  record: PrefaceAndPostscriptClassic;
  showTag: boolean;
  router: AppRouterInstance;
  slug: string
}
export default function PrefaceAndPostscriptListItem({ record, showTag, router, slug }: PrefaceAndPostscriptListItemProps) {
  return (
    <div>
      <Collapse
        ghost
        items={[
          {
            key: record.name,
            label: <span className="text-[#c19d50]">{record.name + " "} {showTag && <Tag color={colorMap["序跋"]}>序跋</Tag>} <Badge count={record.related_data.length} style={{ marginInlineStart: 4 }} /></span>,
            children: (
              <div>
                {record.related_data.map((preface_and_postscript: PrefaceAndPostscript) => (
                  <div key={preface_and_postscript.id} className="mb-4 p-3 bg-[#f3f1eb] rounded-md" onClick={() => router.push(`/preface_and_postscript/${preface_and_postscript.id}`)}>
                    <ul>
                      <li><strong className="text-[#c19d50]">题目:</strong> {highlightText(preface_and_postscript.title,slug)}</li>
                      <li><strong className="text-[#c19d50]">作者:</strong> {preface_and_postscript.author}</li>
                      <li><strong className="text-[#c19d50]">朝代:</strong> {preface_and_postscript.dynasty}</li>
                      <li><strong className="text-[#c19d50]">翻译者:</strong> {preface_and_postscript.translator}</li>
                      <li><strong className="text-[#c19d50]">分类:</strong> {preface_and_postscript.category}</li>
                      <li><strong className="text-[#c19d50]">所属经文:</strong> {preface_and_postscript.classic}</li>
                      <li><strong className="text-[#c19d50]">册:</strong> {preface_and_postscript.copy_id}</li>
                      <li><strong className="text-[#c19d50]">页:</strong> {preface_and_postscript.page_id}</li>
                    </ul>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
