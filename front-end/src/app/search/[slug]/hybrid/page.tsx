'use client'
import { searchHybrid } from '@/lib/hybrid';
import { ProList } from '@ant-design/pro-components';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Person } from '@/lib/individual';
import { getIdentityList, GraphDetail } from '@/lib/graph_zhi'
import { ContentItem, } from '@/lib/colophon';
import { PrefaceAndPostscriptClassic } from '@/lib/preface_and_postscript'
import IndividualListItem from '@/components/list_item/IndividualListItem';
import ColophonListItem from '@/components/list_item/ColophonListItem';
import PrefaceAndPostscriptListItem from '@/components/list_item/PrefaceAndPostscriptListItem';
import GraphListItem from '@/components/list_item/GraphListItem';
import { identityColorList } from '@/utils/getColor';

type CombinedItem =
  | { type: '人物'; data: Person }
  | { type: '牌记'; data: ContentItem }
  | { type: '序跋'; data: PrefaceAndPostscriptClassic }
  | { type: '径山志'; data: GraphDetail };

export default function page() {
  const [colorMap, setColorMap] = useState({})
  const [combinedList, setCombinedList] = useState<CombinedItem[]>([]);
  let { slug } = useParams();
  if (Array.isArray(slug)) {
    slug = slug.join('');
  }
  const router = useRouter();

  useEffect(() => {
    getIdentityList().then(res => {
      const map = {};
      res.forEach((item, index) => {
        map[item] = identityColorList[index % identityColorList.length];
      });
      setColorMap(map);
    });
  }, []);


  return (
    <div className="h-full overflow-y-auto rounded-md">
      <ProList
        rowKey="name"
        headerTitle="全局检索"
        request={async (params) => {
          console.log(params)
          const { current = 1, pageSize = 10 } = params;
          const { data, total, success } = await searchHybrid(slug, current, pageSize);
          const combinedList: CombinedItem[] = []
          data.individual.forEach((person: Person) => {
            combinedList.push({ type: '人物', data: person })
          })
          data.colophon.forEach((colophon: ContentItem) => {
            combinedList.push({ type: '牌记', data: colophon })
          })
          data.preface_and_postscript.forEach((prefaceAndPostscriptclassic: PrefaceAndPostscriptClassic) => {
            combinedList.push({ type: '序跋', data: prefaceAndPostscriptclassic })
          })
          data.graph.forEach((graph: GraphDetail) => {
            combinedList.push({ type: '径山志', data: graph })
          })
          setCombinedList(combinedList)
          return {
            data: combinedList,
            total: total,
            success: success,
          };
        }}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          defaultPageSize: 20,
        }}
        metas={{
          title: {
            render: (text, record) => (
              <div >
                {
                  record.type === "序跋" && (
                    <PrefaceAndPostscriptListItem record={record.data} showTag={true} router={router} slug={decodeURI(slug)} />
                  )
                }
                {
                  record.type === '牌记' && (
                    <ColophonListItem record={record.data} showTag={true} router={router} slug={decodeURI(slug)} />)
                }
                {
                  record.type === '人物' && (
                    <IndividualListItem record={record.data} showTag={true} paddingLeft={true}></IndividualListItem>
                  )
                }
                {
                  record.type === "径山志" && (
                    <GraphListItem record={record.data} router={router} showTag={true} graph_colorMap={colorMap} />
                  )
                }
              </div>
            ),
          },
        }}
      />
    </div>
  )
}
