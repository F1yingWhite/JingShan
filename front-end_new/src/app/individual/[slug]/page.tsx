'use client'
import { IndividualDetail, getIndividualDetailById, PersonTime, Details } from "@/lib/individual";
import { useEffect, useState } from "react";
import Mapbox from "@/components/Mapbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ProList } from '@ant-design/pro-components';

export default function Page({
  params,
}: {
  params: { slug: string }
}) {
  const [time, setTime] = useState<PersonTime>();
  const [details, setDetails] = useState<Details>({});
  const [name, setName] = useState<string>();
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
    content: items,  // 保存详细信息
  }));

  return (
    <div className="flex h-full">
      {/* 左边区域 */}
      <div className="flex-1 p-4 border-r border-gray-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <h2 className="text-4xl font-semibold text-[#c19d50] text-center">{name}</h2>
        <ProList
          rowKey="title"
          dataSource={formattedDetails}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '10px 0' }}>
                <ul>
                  {record.content.map((item, index) => (
                    <li key={index} className="mb-2">
                      <p>{item.content}</p>
                      <p>{item.description}</p>
                      <p>{item.type}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          }}
          metas={{
            title: {
              render: (text, record) => <a>{record.title}</a>,
            },
            description: {
              render: () => null,
            },
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
