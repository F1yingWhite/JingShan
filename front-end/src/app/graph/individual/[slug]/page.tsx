'use client'
import React, { useEffect, useState } from 'react'
import RelationChart from '@/components/charts/RelationChart'
import { Graph, getGraphByName, getGraphDetailByName, GraphDetail, GraphLists, getIdentityList } from '@/lib/graph_zhi';
import { ProList } from '@ant-design/pro-components';
import { useRouter } from 'next/navigation';
import { identityColorList } from '@/utils/getColor';
import GraphListItem from '@/components/list_item/GraphListItem';
import Tag from '@/components/Tag';
import { Breadcrumb } from 'antd';

export default function page({ params }: { params: { slug: string } }) {
  const [graph, setGraph] = useState<Graph>()
  const [graphDetail, setGraphDetail] = useState<GraphLists>()
  const slug = decodeURIComponent(params.slug);
  const [individual, setIndividual] = useState<GraphDetail>();
  const attribute_list = ["别名", "朝代", "生年", "卒年", "报龄", "僧腊", "出家地", "籍贯", "身份", "世代", "具戒时间", "修法", "宗派", "出家前学法过程", "开悟记述", "法语", "生平史传", "人名规范资料库",];
  const [colorMap, setColorMap] = useState({})
  useEffect(() => {
    getIdentityList().then(res => {
      const map = {};
      res.forEach((item, index) => {
        // 不要放自己
        map[item] = identityColorList[index % identityColorList.length];
      });
      setColorMap(map);
    });
  }, []);

  useEffect(() => {
    getGraphByName(slug).then(graph => {
      if (graph) {
        const fetchGraphDetails = async () => {
          const details = [];
          for (const node of graph.nodes) {
            const res = await getGraphDetailByName(node.name);
            if (node.name === slug) {
              setIndividual(res[0]);
            } else {
              details.push(res[0]);
            }
          }
          setGraphDetail(details);
        };
        fetchGraphDetails().then(() => {
          setGraph(graph);
        });
      }
    });
  }, [slug]);

  useEffect(() => {
    getIdentityList().then(res => {
      const map = {};
      res.forEach((item, index) => {
        map[item] = identityColorList[index % identityColorList.length];
      });
      setColorMap(map);
    });
  }, []);

  const router = useRouter();
  return (
    <div className='w-full h-full max-w-[1200px] mx-auto p-8'>
      <div>
        <Breadcrumb
          separator={<div className='text-lg'>&gt;&gt;</div>}
          items={[
            {
              title: <a href='/' className='text-lg'>主页</a>,
            },
            {
              title: <a href="/overview/graph" className='text-lg'>径山寺</a>,
            },
            {
              title: <a href={`/graph/individual/${slug}`} className='text-lg'>人物关系图</a>,
            }
          ]}
        />
      </div>
      <div className="flex items-center gap-4 mt-8 mb-8">
        <Tag text="径山寺" color="#1A2B5C" opacity={0.7} />
        <div className='text-4xl font-bold'>
          {individual?.姓名}
        </div>
      </div>
      {/* TODO:样式设计 */}
      {individual && attribute_list.map((key, index) => {
        if (individual[key]) {
          return (
            Array.isArray(individual[key]) && individual[key].some(item => item !== '无') ? (
              <div key={index}>
                <Tag text={key} color="#DAA520" opacity={0.2} textColor='black' />
                <div>
                  {individual[key].map(
                    (item, index) =>
                      item !== '无' && (
                        <span key={index} className='p-2'>
                          {item}
                        </span>
                      )
                  )}
                </div>
              </div>
            ) : !Array.isArray(individual[key]) && individual[key] !== '无' ? (
              <div key={index} >
                <Tag text={key} color="#DAA520" opacity={0.2} textColor='black' />
                {individual[key]}
              </div>
            ) : null
          );
        }
        return null;
      })}
      <div className="text-2xl font-bold text-center my-4 text-[#1A2B5C]">人物关系图</div>
      <div className="h-2/3"><RelationChart graph={graph} layout='none' emphasis={true} zoom={1} /></div>
      <ProList<GraphDetail>
        rowKey="name"
        headerTitle="相关人物列表"
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        dataSource={graphDetail}
        metas={{
          title: {
            title: "人物名称",
            render: (text, record) => {
              return <GraphListItem showTag={false} record={record} router={router} graph_colorMap={colorMap} />
            },
          },
        }}
      />
    </div>
  )
}
