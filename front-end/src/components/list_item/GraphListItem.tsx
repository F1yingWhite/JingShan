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

  const attribute_list = ['世代', '俗姓/名', '别名', '朝代', '生年月日', '生年干支', '卒年月日', '卒年干支', '报龄', '僧腊', '郡望', '祖', '父', '母', '亲友', '出家前纪录_神异', '出家前纪录_求学', '出家前纪录_出仕', '出家前纪录_婚姻', '出家前纪录_子嗣', '出家前学法过程', '出家地', '披剃：时', '具戒时间', '修法', '宗派', '开悟记述', '法语一', '法语二', '法语三', '法语四', '法语五', '法语六', '法语七', '住锡_弘化记述', '住锡径山禅寺_期间起讫', '住锡径山禅寺_人物_事迹', '中外交流事迹_期间起讫', '中外交流事迹_人物_地点', '朝廷往来记述_事件', '朝廷赐号_謚号', '后代追謚记述_謚号_碑铭', '圆寂_末后偈', '建塔_祖师塔', '拓片遗迹', '生平史传', '著述_语录_著作_文集_序', '社会关系_期间起讫_事件记述_人物_地点', '资料出处列表', '相关学术论文', '人名规范数据库', '备注'];

  return (
    <div>
      {Object.keys(record).some(key => key !== '名号' && key !== 'type' && key !== '编号') ? (
        <Collapse
          ghost
          items={[
            {
              key: record.名号,
              label: (
                <span
                  className="text-[#c19d50]"
                  onClick={() => {
                    router.push(`/graph/individual/${encodeURIComponent(record.名号)}`);
                  }}
                >
                  {record.名号 + ' '}
                  {showTag && <Tag color={colorMap['径山志']}>径山志</Tag>}
                  {record.身份 && <Tag color={graph_colorMap[record.身份]}>{record.身份}</Tag>}
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
            router.push(`/graph/individual/${encodeURIComponent(record.名号)}`);
          }}
        >
          {record.名号 + ' '}
          {showTag && <Tag color={colorMap['径山志']}>径山志</Tag>}
        </span>
      )}
    </div>
  );
}