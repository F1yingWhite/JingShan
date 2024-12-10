'use client'
import React, { useEffect, useState } from 'react'
import { Story, generatePicture, getStoryDetail } from "@/lib/story"
import { Breadcrumb, Image, Spin } from 'antd'
import Tag from '@/components/Tag'

export default function Page({ params }: { params: { slug: string } }) {
  const [story, setStory] = useState<Story>()
  const [img, setImg] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)
  const slug = params.slug;

  useEffect(() => {
    getStoryDetail(+slug).then((data) => {
      setStory(data)
      generatePicture({ "content": data.content }).then((res) => {
        setImg(`data:image/jpeg;base64,${res.data.img}`)
        setLoading(false)
      })
    })
  }, [slug])

  return (
    <div
      className="flex h-full flex-wrap max-w-[1200px] mx-auto justify-center"
    >
      <div className="w-full flex flex-row">
        <div className="w-full  md:w-1/3 p-8  overflow-y-auto">
          <div className='pb-8'>
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
                  title: <a href="/overview/story" className='text-lg'>古诗</a>,
                }
              ]}
            />
          </div>
          {story && (
            <div>
              <div className="flex items-center gap-4">
                <Tag text="古诗" color="#1A2B5C" opacity={0.7} />
                <div className='text-4xl font-bold'>
                  {story.title}
                </div>
              </div>
              <p className="mb-6 mt-6 leading-relaxed">
                {story.content}
                大慧禅风以禅宗正脉广布天下禅林，绵邈于今而不衰。此因大慧禅师所证所传之道大，故其能摄者众。  虚堂禅师以广大愿，年届八旬，犹于径山凌霄峰前激扬妙义。道不分古今，地不分南北，他的一句“东海儿孙日转多”，让日本的一休和尚自称其为径山虚堂六世孙。径山虚堂的法脉在当今日本禅林发挥着主流的影响力。  宋代径山祖师，其禅道广大，其法脉幽远。  明朝末年，禅门已显衰微之相，被誉为明末四大高僧之一的紫柏大师，卓锡径山，倡印大藏经，以禅教互融重光祖印。历时两百年，字数达一亿的《径山藏》，成为了中国佛教史上的皇皇巨著。  明代的径山祖师行道艰辛，却奋志卓绝。  明代《径山志》里，一篇碑文的开篇这样说“径山，名为天下东南第一释寺。寺何以重？以道重也。”  无论是蕴道应缘，禅道广大，还是行道艰辛，1200年来的径山祖师念兹在兹，不离此道。双径单传佛祖心，钟鼓时宣妙法音。
              </p>
            </div>
          )
          }
        </div >
        <div className="w-full md:w-2/3  pt-20">
          {loading ? <Spin /> : <Image src={img} />}
        </div>
      </div>
    </div>
  )

}