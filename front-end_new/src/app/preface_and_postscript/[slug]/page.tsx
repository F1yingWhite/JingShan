'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Spin } from 'antd';
import { getPdf, getPdfLength } from '@/lib/pdf';
import { getPrefaceAndPostscriptById, PrefaceAndPostscript } from '@/lib/preface_and_postscript';

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [preface_and_postscript, setPrefaceAndPostscript] = useState<PrefaceAndPostscript>();
  const [pdf_id, setPdfId] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [pageHeight, setPageHeight] = useState<number>(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: PrefaceAndPostscript = await getPrefaceAndPostscriptById(+slug);
        setPrefaceAndPostscript(res);
        setPdfId(res.copy_id);
        const res2 = await getPdfLength('preface_and_postscript', res.copy_id);
        setTotalPages(res2.length);
        const pageHeight = await fetchPdfPage(res.page_id, res.copy_id);
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
        const res = await getPdf('preface_and_postscript', pdfId, page);
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
      <div className="w-2/5 overflow-y-auto" ref={containerRef}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <div key={index} data-page={index} className="mb-4" style={{ height: 'auto' }}>
            {pdfPages[index] ? (
              <Image src={pdfPages[index]} alt={`Page ${index + 1}`} style={{ height: 'auto', width: '100%' }} />
            ) : (
              <div className="flex justify-center items-center" style={{ height: pageHeight }}>
                {pageHeight !== 0 && <Spin />}
              </div>
            )}
          </div>
        ))}
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