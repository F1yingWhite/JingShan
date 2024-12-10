'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Breadcrumb, Button, Image, Space, Spin } from 'antd';
import { getPdf } from '@/lib/pdf';
import { getPrefaceAndPostscriptById, PrefaceAndPostscript } from '@/lib/preface_and_postscript';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Tag from '@/components/Tag';

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const [preface_and_postscript, setPrefaceAndPostscript] = useState<PrefaceAndPostscript>();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: PrefaceAndPostscript = await getPrefaceAndPostscriptById(+slug);
        setPrefaceAndPostscript(res);
        const res2 = await getPdf('preface_and_postscript', res.copy_id, res.page_id);
        setPdfPage(`data:image/jpeg;base64,${res2.image}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [slug]);

  return (
    <div>

      <div className="flex h-full flex-wrap">
        {+slug > 1 && (
          <Button
            className="rounded-full"
            onClick={() => router.push(`/preface_and_postscript/${+slug - 1}`)}
            icon={<LeftOutlined style={{ color: 'white' }} />}
            style={{ position: 'fixed', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
          />
        )}
        {+slug < 4777 && (
          <Button
            className="rounded-full"
            onClick={() => router.push(`/preface_and_postscript/${+slug + 1}`)}
            icon={<RightOutlined style={{ color: 'white' }} />}
            style={{ position: 'fixed', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
          />
        )}

        <div className="w-full md:w-3/5 p-8 bg-white overflow-y-auto">
          <div className='pb-8'>
            <Breadcrumb
              separator=">>"
              items={[
                {
                  title: <a href='/'>主页</a>,
                },
                {
                  title: <a href="">径山藏</a>,
                },
                {
                  title: <a href="/overview/preface_and_postscript">序跋</a>,
                }
              ]}
            />
          </div>
          {preface_and_postscript && (
            <div>
              <div className="flex items-center gap-4 pb-8">
                <Tag text="序跋" color="#1A2B5C" opacity={0.7} />
                <div className='text-4xl font-bold'>
                  {preface_and_postscript.title}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: "48px" }}>
                {[
                  { label: "篇名", value: preface_and_postscript.title },
                  { label: "典籍", value: preface_and_postscript.classic },
                  { label: "作者", value: preface_and_postscript.author },
                  { label: "译者", value: preface_and_postscript.translator },
                  { label: "类别", value: preface_and_postscript.category },
                  { label: "朝代", value: preface_and_postscript.dynasty },
                  { label: "册", value: preface_and_postscript.copy_id },
                  { label: "页", value: preface_and_postscript.page_id },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-1 flex flex-col"
                    style={{
                      alignItems: "center",
                      flexGrow: 1,
                      textAlign: "center"
                    }}
                  >
                    <div style={{ writingMode: "vertical-rl" }}>
                      <Tag text={item.label} color="#DAA520" opacity={0.2} textColor="black" />
                    </div>
                    <div className="pt-2" style={{ writingMode: "vertical-rl" }}>
                      {item.value || "未知"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 flex items-center justify-center overflow-auto" ref={containerRef}>
          {pdfPage ? (
            <Image src={pdfPage} alt={`Page ${slug}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
          ) : (
            <div className="flex justify-center items-center" style={{ height: '100%', width: '100%' }}>
              <Spin />
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
