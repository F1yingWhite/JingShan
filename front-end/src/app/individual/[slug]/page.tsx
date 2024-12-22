'use client'
import { IndividualDetail, getIndividualDetailById, PersonTime, Details } from "@/lib/individual";
import { useEffect, useState } from "react";
import Mapbox from "@/components/Mapbox";
import { ProList } from '@ant-design/pro-components';
import { Badge, Breadcrumb, Collapse } from 'antd';
import TimeChart from "@/components/TimeChart";
import { useRouter } from "next/navigation";
import Tag from "@/components/Tag";

export default function Page({ params }: { params: { slug: string } }) {
  const [time, setTime] = useState<PersonTime>();
  const [details, setDetails] = useState<Details>({});
  const [name, setName] = useState<string>();
  const [searchKey, setSearchKey] = useState<string>('');
  const slug = params.slug;
  const router = useRouter();
  useEffect(() => {
    getIndividualDetailById(+slug).then((data) => {
      setName(data.name);
      setTime(data.time);
      setDetails(data.details);
    });
    window.scrollTo(0, 0);
  }, [slug]);


  const formattedDetails = Object.entries(details).map(([key, items]) => ({
    title: key,
    content: items,
  }));

  const filteredDetails = formattedDetails.filter(item =>
    item.title.toLowerCase().includes(searchKey.toLowerCase())
  ).map(item => ({
    ...item,
    count: item.content.length,
  }));

  const renderBadge = (count: number) => (
    <Badge count={count} style={{ marginInlineStart: 4 }} />
  );

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
    <div className="h-full pl-8 pr-8 flex-wrap max-w-[1200px] mx-auto justify-center"
    >
      < div className="pt-8 pb-8" >
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
              title: <a href="/overview/individual" className='text-lg'>人物</a>,
            }
          ]}
        />
      </div >
      <div className="flex items-center gap-4">
        <Tag text="人物" color="#1A2B5C" opacity={0.7} />
        <div className='text-4xl font-bold'>
          {name}
        </div>
      </div>
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row">
        <div className="order-2 md:order-1 w-full md:w-3/5">
          <ProList
            rowKey="title"
            dataSource={filteredDetails}
            pagination={{
              pageSizeOptions: ['5', '10', '20', '50'],
              defaultPageSize: 20,
            }}
            // request={async (params = {}) => {
            //   let { current, pageSize, title } = params;
            //   if (title === undefined) {
            //     title = '';
            //   }
            //   const res = await getAllIndividuals(current, pageSize, title);
            //   return {
            //     data: res.data.data,
            //     total: res.data.total,
            //   };
            // }}
            metas={{
              title: {
                render: (text, record) => (
                  <Collapse
                    ghost
                    items={[
                      {
                        key: record.title,
                        label: (
                          <span>
                              <a className="text-[#1A2B5C]">{record.title}</a>
                            {renderBadge(record.count)}
                          </span>
                        ),
                        children: (
                          <div>
                            {record.content.map((item, index) => (
                              <div key={index} className="mb-4 bg-[#f3f1eb] p-3 rounded-md" onClick={() => { router.push(`/colophon/${item.colophon_id}`) }}>
                                <p className="text-[#c19d50] font-bold">参与活动:</p>
                                <p>{item.type.replace(/^类型为：/, '')}</p>
                                <p className="text-[#c19d50] font-bold">相关牌记:</p>
                                <p>{highlightText(item.content, name || '')}</p>
                                <p className="text-[#c19d50] font-bold">活动地点：</p>
                                <p>{item.place}</p>
                              </div>
                            ))}
                          </div>
                        ),
                        showArrow: true,
                      },
                    ]}
                  />
                ),
              },
              description: {
                render: () => null,
              },
            }}
            toolbar={{
              menu: {
                items: [
                  {
                    key: 'tab1',
                    label: (
                      <span>出现经文{renderBadge(formattedDetails.length)}</span>
                    ),
                  },
                ],
              },
              search: {
                onSearch: (value) => {
                  setSearchKey(value);
                },
                placeholder: '请输入搜索关键字',
              }
            }}
          />
        </div>
        <div className="order-1 md:order-2 w-full md:w-2/5">
          <div className="h-auto p-4">
            <div className="h-[300px] md:h-[300px] lg:h-[400px]">
              <h2 className="text-lg font-semibold text-center">刻经时间</h2>
              {time && <TimeChart chartData={time}></TimeChart>}
            </div>
          </div>
          <div className="h-auto p-4">
            <h2 className="text-lg font-semibold text-center">相关藏经地点</h2>
            <div className="h-[300px] md:h-[300px] lg:h-[400px]">
              <Mapbox id={+slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}