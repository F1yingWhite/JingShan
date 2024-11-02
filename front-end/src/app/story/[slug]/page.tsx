'use client'
import React, { useEffect, useState } from 'react'
import { Story, generatePicture, getStoryDetail } from "@/lib/story"
import { Image, Spin } from 'antd'

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
    <div className='overflow-auto'>
      <h1>{story?.title}</h1>
      <p>{story?.content}</p>
      {loading ? <Spin /> : <Image src={img} />}
    </div>
  )
}