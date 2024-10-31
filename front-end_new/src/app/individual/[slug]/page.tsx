'use client'
import { IndividualDetail, getIndividualDetailById, PersonTime, Details } from "@/lib/individual";
import { useEffect, useState } from "react";
import Mapbox from "@/components/Mapbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ProList } from '@ant-design/pro-components';
import { Badge, Collapse } from 'antd';

export default function Page({ params }: { params: { slug: string } }) {
  const [time, setTime] = useState<PersonTime>();
  const [details, setDetails] = useState<Details>({});
  const [name, setName] = useState<string>();
  const [searchKey, setSearchKey] = useState<string>('');
  const slug = params.slug;

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

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 border-r border-gray-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <h2 className="text-4xl font-semibold text-[#c19d50] text-center p-5">{name}</h2>
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
                            <div key={index} className="mb-4">
                              <p className="text-[#c19d50] font-bold">参与活动:</p>
                              <p>{item.type.replace(/^类型为：/, '')}</p>
                              <p className="text-[#c19d50] font-bold">相关牌记:</p>
                              <p>{item.content}</p>
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

      <div className="flex-2 flex flex-col w-1/2 h-full">
        <div className="h-1/2 p-4">
          <h2 className="text-lg font-semibold text-[#c19d50] text-center">活跃年代</h2>
          {chartData.length > 0 && (
            <LineChart data={chartData} width={500} height={250}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="次数" stroke="#c19d50" />
            </LineChart>
          )}
        </div>

        <div className="h-1/2 p-4">
          <h2 className="text-lg font-semibold text-[#c19d50] text-center">相关藏经地点</h2>
          <Mapbox />
        </div>
      </div>
    </div>
  );
}
