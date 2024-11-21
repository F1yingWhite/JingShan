'use client'
import { IndividualDetail, getIndividualDetailById, PersonTime, Details } from "@/lib/individual";
import { useEffect, useState } from "react";
import Mapbox from "@/components/Mapbox";
import { ProList } from '@ant-design/pro-components';
import { Badge, Collapse } from 'antd';
import TimeChart from "@/components/TimeChart";
import { useRouter } from "next/navigation";

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
  }, [slug]);

  const chartData = time
    ? Object.entries(time).map(([time, value]) => ({
      time,
      "次数": value,
    }))
    : [];

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
    <div className="flex flex-col-reverse md:flex-row h-full overflow-auto">
      <div className="md:flex-1 p-4 border-r border-gray-300 lg:overflow-y-auto">
        <h2 className="text-4xl font-semibold text-[#c19d50] text-center p-5 hidden md:block">{name}</h2>
        <ProList
          rowKey="title"
          dataSource={filteredDetails}
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
                          <a className="text-[#c19d50]">{record.title}</a>
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
                              <p className="text-[#c19d50] font-bold">补充说明：</p>
                              <p>{item.description}</p>
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
                    <span>全部活动{renderBadge(formattedDetails.length)}</span>
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

      <div className="md:flex-2 flex flex-col w-full md:w-1/2 h-full lg:h-auto">
        <h2 className="text-4xl font-semibold text-[#c19d50] text-center p-5 block md:hidden">{name}</h2>
        <div className="md:h-full lg:h-1/2 p-4">
          <h2 className="text-lg font-semibold text-[#c19d50] text-center">刻经时间</h2>
          {time && <TimeChart chartData={time}></TimeChart>}
        </div>
        <hr className="my-4 border-t border-[#c19d50]" />
        <div className="md:h-full lg:h-1/2 p-4">
          <h2 className="text-lg font-semibold text-[#c19d50] text-center">相关藏经地点</h2>
          <Mapbox id={+slug} />
        </div>
      </div>
    </div >
  );
}