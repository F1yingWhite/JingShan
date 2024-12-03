import { GraphDetail } from '@/lib/graph_zhi';
import { colorMap } from '@/utils/getColor';
import { Collapse, Tag } from 'antd';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import React from 'react';

interface GraphListItemProps {
  record: GraphDetail;
  showTag: boolean;
  router: AppRouterInstance;
  graph_colorMap: Record<string, string>
}

export default function GraphListItem({ record, showTag, router, graph_colorMap }: GraphListItemProps) {

  return (
    <div>
      {Object.keys(record).some(key => key !== '姓名') ? (
        <Collapse
          ghost
          items={[
            {
              key: record.姓名,
              label: (
                <span
                  className="text-[#c19d50]"
                  onClick={() => {
                    router.push(`/graph/individual/${encodeURIComponent(record.姓名)}`);
                  }}
                >
                  {record.姓名 + ' '}
                  {showTag && <Tag color={colorMap['径山志']}>径山志</Tag>}
                  <Tag color={graph_colorMap[record.身份]}>{record.身份}</Tag>
                </span>
              ),
              children: (
                <div>
                  <ul>
                    {Object.keys(record).map((key) => {
                      if (key !== '姓名') {
                        return (
                          <li key={key}>
                            <span className="text-[#c19d50]">{key}</span>: {Array.isArray(record[key]) ? record[key].join(', ') : record[key]}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <span
          className="text-[#c19d50] ml-10"
          onClick={() => {
            router.push(`/graph/${encodeURIComponent(record.姓名)}`);
          }}
        >
          {record.姓名 + ' '}
          {showTag && <Tag color={colorMap['径山志']}>径山志</Tag>}
        </span>
      )}
    </div>
  );
}