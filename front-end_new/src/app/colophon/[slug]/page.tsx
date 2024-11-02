'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Collapse, Image, Spin } from 'antd';
import { getPdf, getPdfLength } from '@/lib/pdf';
import { getColophonById, Colophon } from '@/lib/colophon';
import { ProList } from '@ant-design/pro-components';
import Link from 'next/link';

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [colophon, setColophon] = useState<Colophon>();
  const [pdf_id, setPdfId] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [pageHeight, setPageHeight] = useState<number>(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: Colophon = await getColophonById(+slug);
        setColophon(res);
        setPdfId(res.pdf_id);
        const res2 = await getPdfLength('colophon', res.pdf_id);
        setTotalPages(res2.length);
        const pageHeight = await fetchPdfPage(res.page_id, res.pdf_id);
        if (pageHeight !== undefined) {
          setPageHeight(pageHeight);
        }
        if (containerRef.current && pageHeight) {
          containerRef.current.scrollTo(0, (res.page_id) * (pageHeight + 16));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [slug]);

  const fetchPdfPage = async (page: number, pdfId: number) => {
    if (!pdfPages[page]) {
      try {
        const res = await getPdf('colophon', pdfId, page);
        const pdfBase64 = res.image;
        const pdfUrl = `data:image/jpeg;base64,${pdfBase64}`;
        setPdfPages((prevPages) => {
          const newPages = [...prevPages];
          newPages[page] = pdfUrl;
          return newPages;
        });

        const img = new window.Image();
        img.src = pdfUrl;
        return new Promise<number>((resolve) => {
          img.onload = () => {
            document.body.appendChild(img);
            const pageHeight = img.clientHeight;
            document.body.removeChild(img);
            resolve(pageHeight);
          };
        });
      } catch (error) {
        console.error(`Error fetching PDF page ${page}:`, error);
      }
    }
  };

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const page = Number(entry.target.getAttribute('data-page'));
      if (entry.isIntersecting) {
        timersRef.current[page] = setTimeout(() => {
          fetchPdfPage(page, pdf_id);
        }, 500);
      } else {
        if (timersRef.current[page]) {
          clearTimeout(timersRef.current[page]);
          delete timersRef.current[page];
        }
      }
    });
  }, [pdfPages, pdf_id]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.1,
    });

    const pageElements = document.querySelectorAll('[data-page]');
    pageElements.forEach(page => observer.observe(page));

    return () => {
      pageElements.forEach(page => observer.unobserve(page));
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, [handleIntersection]);


  return (
    <div className="flex h-full">
      <div className="w-1/3 overflow-y-auto" ref={containerRef}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <div key={index} data-page={index} className="mb-4" style={{ height: 'auto' }}>
            {pdfPages[index] ? (
              <Image src={pdfPages[index]} alt={`Page ${index + 1}`} style={{ height: 'auto', width: '100%' }} />
            ) : (
              <div className="flex justify-center items-center" style={{ height: pageHeight }}>
              </div>
            )}
          </div>
        ))}
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
                <strong className="font-semibold text-[#A48F6A]">卷数：</strong> {colophon.volume_id} / {colophon.chapter_id}
              </div>
              <div>
                <strong className="font-semibold text-[#A48F6A]">册数：</strong> 原藏序目 / 第{colophon.page_id}页
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
        <ProList
          rowKey="title"
          dataSource={colophon?.related_individuals}
          metas={{
            title: {
              render: (text, record) => (
                <div>
                  <p className="text-[#c19d50] font-bold">人物姓名:</p>
                  <Link href={`/individual/${record.id}`}>{record.name}</Link>
                  <p className="text-[#c19d50] font-bold">参与活动:</p>
                  <p>{record.type.replace(/^类型为：/, '')}</p>
                  <p className="text-[#c19d50] font-bold">补充说明:</p>
                  <p>{record.description}</p>
                </div>
              ),
            },
            description: {
              render: () => null,
            },
          }} />
      </div>
    </div>
  );
}