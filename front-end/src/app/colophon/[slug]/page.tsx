'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Breadcrumb, Button, FloatButton, Image, Spin } from 'antd';
import { getPdf } from '@/lib/pdf';
import { getColophonById, Colophon, getScriptureList } from '@/lib/colophon';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Tag from '@/components/Tag';
import ScollList from '@/components/ScrollList';

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const [colophon, setColophon] = useState<Colophon>();
  const [pdf_id, setPdfId] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: Colophon = await getColophonById(+slug);
        setColophon(res);
        setPdfId(res.pdf_id);
        const page = res.page_id;
        const res2 = await getPdf('colophon', res.pdf_id, page);
        const pdfBase64 = res2.image;
        setPdfPage(`data:image/jpeg;base64,${pdfBase64}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [slug]);


  return (
    <div className="flex h-full flex-col max-w-[1200px] mx-auto">
      {
        +slug > 1 &&
        <Button
          className="rounded-full"
          onClick={() => { router.push(`/colophon/${+slug - 1}`) }}
          icon={<LeftOutlined style={{ color: 'white' }} />}
          style={{ position: 'fixed', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
        />
      }
      {
        +slug < 9160 &&
        <Button
          onClick={() => { router.push(`/colophon/${+slug + 1}`) }}
          icon={<RightOutlined style={{ color: 'white' }} />}
          style={{ position: 'fixed', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
        />
      }
      <div className='p-8'>
        <Breadcrumb
          separator={<div className='text-lg'>&gt;&gt;</div>}
          items={[
            {
              title: <a href='/' className='text-lg'>主页</a>,
            },
            {
              title: <a href="" className='text-lg'>径山藏</a>,
            },
            {
              title: <a href="/overview/colophon" className='text-lg'>牌记</a>,
            }
          ]}
        />
      </div>
      <div className="w-full flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 pl-8">
          {colophon && (
            <div>
              <div className="flex items-center gap-4">
                <Tag text="牌记" color="#1A2B5C" opacity={0.7} />
                <div className='text-4xl font-bold'>
                  {colophon.scripture_name}
                </div>
              </div>
              <p className="mb-6 mt-6 leading-relaxed">{colophon.content}</p>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: "经名", value: colophon.scripture_name },
                  { label: "卷数", value: colophon.volume_id },
                  { label: "册数", value: colophon.chapter_id },
                  { label: "千字文", value: colophon.qianziwen },
                  { label: "刊刻时间", value: colophon.time },
                  { label: "刊刻地点", value: colophon.place },
                  { label: "计字", value: colophon.words_num },
                  { label: "该银", value: colophon.money },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Tag text={item.label} color="#DAA520" opacity={0.2} textColor='black' />
                    <div className="text-right">
                      {item.value || "未知"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
          }
        </div >
        <div className="w-full md:w-1/3 overflow-auto">
          {pdfPage ? (
            <Image src={pdfPage} alt={`Page ${slug}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
          ) : (
            <div className="flex justify-center items-center" style={{ height: '100%', width: '100%' }}>
              <Spin />
            </div>
          )}
        </div>
      </div>
      <div className='p-8'>
        <div className='pb-8'>
          <Tag text="相关人物" color="#DAA520" opacity={0.2} textColor='black' />
        </div>
        <ProTable
          rowKey="title"
          dataSource={colophon?.related_individuals}
          search={false}
          options={false}
          columns={[
            {
              title: '人物姓名',
              dataIndex: 'name',
              render: (text, record) => (
                <Link className="text-[#c19d50]" href={`/individual/${record.id}`}>{record.name}</Link>
              ),
            },
            {
              title: '参与活动',
              dataIndex: 'type',
            },
            {
              title: '活动地点',
              dataIndex: 'place',
              ellipsis: true,
            },
          ]}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            defaultPageSize: 5,
          }}
        />
      </div>
    </div>
  );
}