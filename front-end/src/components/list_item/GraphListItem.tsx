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

  const attribute_list = ["别名", "朝代", "生年", "卒年", "报龄", "僧腊", "出家地", "籍贯", "身份", "世代", "具戒时间", "修法", "宗派", "出家前学法过程", "开悟记述", "法语", "生平史传", "人名规范资料库",];

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
                    {attribute_list.map((key) => {
                      if (record[key]) {
                        return (
                          Array.isArray(record[key]) && record[key].some(item => item !== '无') ? (
                            <li key={key}>
                              <span className="font-bold">{key}：</span>
                              <span>
                                {record[key].map(
                                  (item, index) =>
                                    item !== '无' && (
                                      <span key={index} className='p-2'>
                                        {item}
                                      </span>
                                    )
                                )}
                              </span>
                            </li>
                          ) : !Array.isArray(record[key]) && record[key] !== '无' ? (
                            <li key={key}>
                              <span className="font-bold">{key}：</span>
                              <span>{record[key]}</span>
                            </li>
                          ) : null
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
            router.push(`/graph/individual/${encodeURIComponent(record.姓名)}`);
          }}
        >
          {record.姓名 + ' '}
          {showTag && <Tag color={colorMap['径山志']}>径山志</Tag>}
        </span>
      )}
    </div>
  );
}