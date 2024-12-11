import { Divider, List, Skeleton } from 'antd'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

type ScollItem = {
  name: string;
  url: string;
}

interface ScollListProps {
  title: string
  loadDataApi: (page: number, page_size: number) => Promise<any>
}

export default function ScollList({ loadDataApi, title }: ScollListProps) {
  const [data, setData] = useState<ScollItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const loadMoreData = () => {
    if (loading) return
    setLoading(true)
    loadDataApi(Math.ceil(data.length / 20) + 1, 20).then((res) => {
      setTotal(res.total_num)
      setData(prevData => [...prevData, ...res.results])
      setLoading(false)
    })
  }

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <div className='w-full h-full pt-8 '>
      <div className='text-center'>{title}</div>
      <div
        id="scrollableDiv"
        className='w-full h-full overflow-y-auto'
      >
        <InfiniteScroll
          dataLength={data.length}
          next={loadMoreData}
          hasMore={data.length < total}
          loader={<Skeleton paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={data}
            renderItem={(item) => (
              <List.Item key={item.name}>
                <Link className='text-[#DAA520] pl-2 truncate' href={item.url}>{item.name}</Link>
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </div>
  )
}