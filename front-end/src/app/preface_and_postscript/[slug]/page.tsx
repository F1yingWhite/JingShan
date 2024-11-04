'use client'
import React, { useEffect, useRef, useState } from 'react';
import { FloatButton, Image, Spin } from 'antd';
import { getPdf } from '@/lib/pdf';
import { getPrefaceAndPostscriptById, PrefaceAndPostscript } from '@/lib/preface_and_postscript';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const [preface_and_postscript, setPrefaceAndPostscript] = useState<PrefaceAndPostscript>();
  const [pdf_id, setPdfId] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: PrefaceAndPostscript = await getPrefaceAndPostscriptById(+slug);
        setPrefaceAndPostscript(res);
        setPdfId(res.copy_id);
        const page = res.page_id;
        const res2 = await getPdf('preface_and_postscript', res.copy_id, page);
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
      {+slug < 4777 &&
        <FloatButton
          onClick={() => { router.push(`/colophon/${+slug + 1}`) }}
          icon={<RightOutlined />}
          style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 9 }}
        />
      }
      <div className="w-2/5 flex items-center justify-center overflow-auto" ref={containerRef}>
        {pdfPage ? (
          <Image src={pdfPage} alt={`Page ${slug}`} style={{ height: 'auto', width: '100%' }} />
        ) : (
          <div className="flex justify-center items-center" style={{ height: 'auto', width: '100%' }}>
            <Spin />
          </div>
        )}
      </div>
      <div className="w-3/5 p-8 bg-[#F8F5ED] overflow-y-auto">
        {preface_and_postscript && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#A48F6A]">序跋</h2>
            <p className="mb-6 leading-relaxed text-[#7C6955]">{preface_and_postscript.content}</p>
            <hr className="my-8 border-t border-[#D9CDBF]" />
            <div className="text-xl text-[#7C6955]">
              {[
                { label: "序跋篇名", value: preface_and_postscript.title },
                { label: "典籍", value: preface_and_postscript.classic },
                { label: "作者", value: preface_and_postscript.author },
                { label: "经译者", value: preface_and_postscript.translator },
                { label: "类别", value: preface_and_postscript.category },
                { label: "朝代", value: preface_and_postscript.dynasty },
                { label: "册", value: preface_and_postscript.copy_id },
                { label: "页", value: preface_and_postscript.page_id },
              ].map((item, index) => (
                <div key={index}>
                  <strong className="font-semibold text-[#A48F6A]">{item.label}:</strong> {item.value}
                  {(index % 2 === 1 && index < 7) && (
                    <hr className="my-8 border-t border-[#D9CDBF]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}