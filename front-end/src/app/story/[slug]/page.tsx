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
              <p className="mb-6 mt-6 leading-relaxed flex flex-col items-center">
                {story.content.split(/。/).map((line, index) => (
                  <React.Fragment key={index}>
                    {line.trim()}
                    {line && <br />}
                  </React.Fragment>
                ))}
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