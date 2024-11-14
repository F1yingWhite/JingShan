'use client'
import { searchHybrid } from '@/lib/hybrid';
import { ProList } from '@ant-design/pro-components';
import { Badge, Collapse, Tag } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Person } from '@/lib/individual';
import { GraphDetail } from '@/lib/graph'
import { ContentItem, Colophon } from '@/lib/colophon';
import { PrefaceAndPostscriptClassic, PrefaceAndPostscript } from '@/lib/preface_and_postscript'
import Link from 'next/link';

type CombinedItem =
  | { type: '人物'; data: Person }
  | { type: '牌记'; data: ContentItem }
  | { type: '序跋'; data: PrefaceAndPostscriptClassic }
  | { type: '径山志'; data: GraphDetail };

export default function page() {
  const colorMap = {
    "人物": "red",
    "序跋": "blue",
    "牌记": "green",
    "径山志": "yellow",
  }
  const [combinedList, setCombinedList] = useState<CombinedItem[]>([]);
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
      <ProList
        rowKey="name"
        headerTitle="全局检索"
        request={async (params = {}) => {
          const { current = 1, pageSize = 10 } = params;
          const { data, total, success } = await searchHybrid(slug, current, pageSize);
          const combinedList: CombinedItem[] = []
          data.individual.forEach((person: Person) => {
            combinedList.push({ type: '人物', data: person })
          })
          data.colophon.forEach((colophon: ContentItem) => {
            combinedList.push({ type: '牌记', data: colophon })
          })
          data.preface_and_postscript.forEach((prefaceAndPostscriptclassic: PrefaceAndPostscriptClassic) => {
            combinedList.push({ type: '序跋', data: prefaceAndPostscriptclassic })
          })
          data.graph.forEach((graph: GraphDetail) => {
            combinedList.push({ type: '径山志', data: graph })
          })
          setCombinedList(combinedList)
          return {
            data: combinedList,
            total: total,
            success: success,
          };
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        metas={{
          title: {
            render: (text, record) => (
              <div >
                {
                  record.type === '人物' && (
                    <Link className="text-[#c19d50] ml-10" href={`/individual/${record.data.id}`} >{record.data.name} <Tag color={colorMap[record.type]}>{record.type}</Tag></Link>
                  )
                }
                {
                  record.type === '牌记' && (
                    <Collapse
                      ghost
                      items={[
                        {
                          key: record.data.name,
                          label: <span className="text-[#c19d50]">{record.data.name} <Tag color={colorMap[record.type]}>{record.type}</Tag> {renderBadge(record.data.related_data.length)}</span>,
                          children: (
                            <div>
                              {record.data.related_data.map((colophon: Colophon) => (
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
                  )
                }
                {
                  record.type === "径山志" && (
                    Object.keys(record.data).some(key => key !== '姓名') ? (
                      <Collapse
                        ghost
                        items={[
                          {
                            key: record.data.姓名,
                            label: <span className="text-[#c19d50]" onClick={() => { router.push(`/graph/${encodeURIComponent(record.data.姓名)}`) }}>{record.data.姓名} <Tag color={colorMap[record.type]}>{record.type}</Tag></span>,
                            children: (
                              <div>
                                <ul>
                                  {Object.keys(record.data).map((key) => {
                                    if (key !== '姓名') {
                                      return (
                                        <li key={key}>
                                          <span className="text-[#c19d50]">{key}</span>: {record.data[key]}
                                        </li>
                                      );
                                    }
                                    return null;
                                  })}
                                </ul>
                              </div>
                            ),
                          },
                        ]}
                      />
                    ) : (
                      <span className="text-[#c19d50] ml-10" onClick={() => { router.push(`/graph/${encodeURIComponent(record.data.姓名)}`) }}>{record.data.姓名} <Tag color={colorMap[record.type]}>{record.type}</Tag></span>
                    )
                  )
                }
                {
                  record.type === "序跋" && (
                    <Collapse
                      ghost
                      items={[
                        {
                          key: record.data.name,
                          label: <span className="text-[#c19d50]">{record.data.name} <Tag color={colorMap[record.type]}>{record.type}</Tag>{renderBadge(record.data.related_data.length)}</span>,
                          children: (
                            <div>
                              {record.data.related_data.map((preface_and_postscript: PrefaceAndPostscript) => (
                                <div key={preface_and_postscript.id} className="mb-4 p-3 bg-[#f3f1eb] rounded-md" onClick={() => router.push(`/preface_and_postscript/${preface_and_postscript.id}`)}>
                                  <ul>
                                    <li><strong>题目:</strong> {preface_and_postscript.title}</li>
                                    <li><strong>作者:</strong> {preface_and_postscript.author}</li>
                                    <li><strong>朝代:</strong> {preface_and_postscript.dynasty}</li>
                                    <li><strong>翻译者:</strong> {preface_and_postscript.translator}</li>
                                    <li><strong>分类:</strong> {preface_and_postscript.category}</li>
                                    <li><strong>所属经文:</strong> {preface_and_postscript.classic}</li>
                                    <li><strong>册:</strong> {preface_and_postscript.copy_id}</li>
                                    <li><strong>页:</strong> {preface_and_postscript.page_id}</li>
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ),
                        },
                      ]}
                    />
                  )
                }
              </div>
            ),
          },
        }}
      />
    </div>
  )
}
