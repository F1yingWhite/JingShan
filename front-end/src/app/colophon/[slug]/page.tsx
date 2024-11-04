'use client'
import React, { useEffect, useRef, useState } from 'react';
import { FloatButton, Image, Spin } from 'antd';
import { getPdf } from '@/lib/pdf';
import { getColophonById, Colophon } from '@/lib/colophon';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const [colophon, setColophon] = useState<Colophon>();
  const [pdf_id, setPdfId] = useState<number>(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="flex h-full">
      {+slug > 1 &&
        <FloatButton
          onClick={() => { router.push(`/colophon/${+slug - 1}`) }}
          icon={<LeftOutlined />}
          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
        />
      }
      {+slug < 9160 &&
        <FloatButton
          onClick={() => { router.push(`/colophon/${+slug + 1}`) }}
          icon={<RightOutlined />}
          style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
        />
      }
      <div className="w-1/3 flex items-center justify-center overflow-auto" ref={containerRef}>
        {pdfPage ? (
          <Image src={pdfPage} alt={`Page ${slug}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
        ) : (
          <div className="flex justify-center items-center" style={{ height: 'auto', width: '100%' }}>
            <Spin />
          </div>
        )}
      </div>
      <div className="w-2/3 p-8 bg-[#F8F5ED] overflow-y-auto">
        {colophon && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[#A48F6A]">碑记内容</h2>
            <p className="mb-6 leading-relaxed text-[#7C6955]">{colophon.content}</p>
            <hr className="my-8 border-t border-[#D9CDBF]" />
            <div className="grid grid-cols-2 gap-8 text-[#7C6955]">
              <div>
                <strong className="font-semibold text-[#A48F6A]">经名：</strong> {colophon.scripture_name}
              </div>
              <div>
                <strong className="font-semibold text-[#A48F6A]">卷数：</strong> {colophon.volume_id}
              </div>
              <div>
                <strong className="font-semibold text-[#A48F6A]">册数：</strong>{colophon.chapter_id}
              </div>
              <div>
                <strong className="font-semibold text-[#A48F6A]">千字文：</strong> {colophon.qianziwen || "Not found"}
              </div>
              <div>
                <strong className="font-semibold text-[#A48F6A]">刊刻时间：</strong> {colophon.time || "未知"}
              </div>
              <div>
                <strong className="font-semibold text-[#A48F6A]">刊刻地点：</strong> {colophon.place || "未知"}
              </div>
            </div>
          </div>
        )}
        <hr className="my-8 border-t border-[#D9CDBF]" />
        <h2 className="text-2xl font-bold mb-6 text-[#A48F6A]">相关人物</h2>
        <ProTable
          rowKey="title"
          dataSource={colophon?.related_individuals}
          headerTitle="相关人物"
          columns={[
            {
              title: '人物姓名',
              dataIndex: 'name',
              render: (text, record) => (
                <Link className="text-[#c19d50]" href={`/individual/${record.id}`}>{record.name}</Link>
              ),
              width: "20%"
            },
            {
              title: '参与活动',
              dataIndex: 'type',
              render: (text) => (typeof text === 'string' ? text.replace(/^类型为：/, '') : text),
              width: "20%"
            },
            {
              title: '补充说明',
              dataIndex: 'description',
              ellipsis: true,
              width: "60%"
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