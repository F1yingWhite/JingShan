'use client'
import React, { useEffect, useState } from 'react';
import { Layout, Input, notification, Carousel, Image, Space } from 'antd';
import { Footer, Content } from 'antd/es/layout/layout';
import { useRouter } from 'next/navigation';
import Lenis from '@/components/Lenis';
const { Search } = Input;


const Title: React.FC<{ text: string }> = ({ text }) => {
  return (
    <>
      <div className='flex items-center'>
        <img src="/decoration_l.svg" alt="Decoration Left" className='h-6 w-6 mr-2' />
        <div className='text-2xl'>{text}</div>
        <img src="/decoration_r.svg" alt="Decoration Right" className='h-6 w-6 ml-2' />
      </div>
      <div className='w-[90vw] border-b mt-2 mb-8'
        style={{ borderColor: 'rgba(218, 165, 32, 0.4)' }}
      ></div>
    </>
  );
};


export default function Page() {
  const router = useRouter();

  const [api, contextHolder] = notification.useNotification();
  const openNotification = () => {
    api.open({
      message: '⚠️警告',
      description:
        '请输入搜索内容',
      duration: 1.5,
    });
  };
  const search = (value: string) => {
    if (value.trim()) {
      value = encodeURIComponent(value);
      router.push(`/search/${value}/hybrid`);
    } else {
      openNotification();
    }
  };

  const [showFooter, setShowFooter] = useState(true);

  const checkHeight = () => {
    setShowFooter(window.innerHeight > 450);
  };

  useEffect(() => {
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  return (
    <Layout className='overflow-auto smooth-scroll'>
      {contextHolder}
      <Content className="flex flex-col items-center">
        {/* 封面 */}
        <Space direction="vertical" size="large" className='w-full'>
          <div
            className="relative flex flex-col items-center h-[80vh] w-full bg-cover bg-center"
            style={{ backgroundImage: `url('/gate.png')` }}
          >
            <div className="absolute inset-0 bg-white opacity-50 backdrop-blur-sm z-10"></div>
            <div className="relative w-1/2 flex flex-col items-center mt-[10vh] z-20">
              <Image
                src="/天下径山.png"
                alt='天下径山'
                width="40vw"
                preview={false}
                className="h-24 sm:h-28 md:h-32 lg:h-36 object-contain"
              />
              <Search
                allowClear
                enterButton="搜索"
                size="large"
                placeholder='请输入关键字'
                className='mt-3 text-black'
                onSearch={search}
              />
            </div>
            <div className='absolute bottom-0 w-full text-white mb-0 z-20 hidden md:block'
              style={{
                backgroundColor: "rgba(218, 165, 32, 0.8)",
                padding: "50px"
              }}
            >
              径山，在宋代文豪苏东坡的笔下“众峰来自天目山，势若骏马奔平川”，在元代住持楚石禅师的眼中“下方凤舞千山去，绝顶龙分两道来”，而明代四大高僧之一的紫柏大师，登径山不禁赞曰“双径萦回云雾深，五峰盘踞星辰簇”。  名山胜景，待人而兴。  开山法钦禅师，在喝石岩畔结茅庐而勤行精进，池成水满月自来，道成则名震天下，唐代宗赐号“国一禅师”，朝中大臣32人皈依径山门下。  继之洪諲禅师，儒佛通达，法济四众。唐僖宗赐寺名“乾符镇国院”，唐昭宗赐洪諲禅师“法济大师”之号。吴越钱王更对洪諲禅师执弟子之礼而厚顾此山。  径山名声大震于唐五代之际，端赖于祖师净行林野，蕴道应缘。宋代大慧禅师，中兴径山祖庭，再振临济宗风。参禅衲子云集径山千僧阁，拈提生命疑情，透脱三界牢关。大慧禅风以禅宗正脉广布天下禅林，绵邈于今而不衰。此因大慧禅师所证所传之道大，故其能摄者众。  虚堂禅师以广大愿，年届八旬，犹于径山凌霄峰前激扬妙义。道不分古今，地不分南北，他的一句“东海儿孙日转多”，让日本的一休和尚自称其为径山虚堂六世孙。径山虚堂的法脉在当今日本禅林发挥着主流的影响力。  宋代径山祖师，其禅道广大，其法脉幽远。  明朝末年，禅门已显衰微之相，被誉为明末四大高僧之一的紫柏大师，卓锡径山，倡印大藏经，以禅教互融重光祖印。历时两百年，字数达一亿的《径山藏》，成为了中国佛教史上的皇皇巨著。
            </div>
          </div>
          {/* 径山藏 */}
          <div className='flex flex-col items-center'>
            <Title text='径山藏' />
            <Space size="middle" className='w-full flex justify-center'>
              <div className='h-[50vh] w-[30vw] bg-gray-300 rounded-lg shadow-lg'>
                牌记
              </div>
              <div className='h-[50vh] w-[30vw] bg-gray-300 rounded-lg shadow-lg'>
                序跋
              </div>
              <div className='h-[50vh] w-[30vw] bg-gray-300 rounded-lg shadow-lg'>
                人物
              </div>
            </Space>
          </div>

          {/* 径山志 */}
          <div className='flex flex-col items-center'>
            <Title text='径山志' />
            <div className='h-[50vh] w-[90vw] bg-gray-300 rounded-lg shadow-lg'>
              牌记
            </div>
          </div>

          {/* 图谱*/}
          <div className='flex flex-col items-center'>
            <Title text='图谱' />
            <Space size="middle" className='w-full flex justify-center'>
              <div className='h-[50vh] w-[45vw] bg-gray-300 rounded-lg shadow-lg'>
                牌记图谱
              </div>
              <div className='h-[50vh] w-[45vw] bg-gray-300 rounded-lg shadow-lg'>
                人物关系图
              </div>
            </Space>
          </div>

          {/* 缘起*/}
          <div className='flex flex-col items-center'>
            <Title text='径山藏缘起' />
            <div
              className='w-full h-[70vh]'
              style={{
                backgroundImage: `url('/缘起bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <div className='bg-white bg-opacity-60 p-10 pt-20 text-sm w-[70vw]'>
                径山，在宋代文豪苏东坡的笔下“众峰来自天目山，势若骏马奔平川”，在元代住持楚石禅师的眼中“下方凤舞千山去，绝顶龙分两道来”，而明代四大高僧之一的紫柏大师，登径山不禁赞曰“双径萦回云雾深，五峰盘踞星辰簇”。  名山胜景，待人而兴。  开山法钦禅师，在喝石岩畔结茅庐而勤行精进，池成水满月自来，道成则名震天下，唐代宗赐号“国一禅师”，朝中大臣32人皈依径山门下。  继之洪諲禅师，儒佛通达，法济四众。唐僖宗赐寺名“乾符镇国院”，唐昭宗赐洪諲禅师“法济大师”之号。吴越钱王更对洪諲禅师执弟子之礼而厚顾此山。  径山名声大震于唐五代之际，端赖于祖师净行林野，蕴道应缘。  宋代大慧禅师，中兴径山祖庭，再振临济宗风。参禅衲子云集径山千僧阁，拈提生命疑情，透脱三界牢关。大慧禅风以禅宗正脉广布天下禅林，绵邈于今而不衰。此因大慧禅师所证所传之道大，故其能摄者众。  虚堂禅师以广大愿，年届八旬，犹于径山凌霄峰前激扬妙义。道不分古今，地不分南北，他的一句“东海儿孙日转多”，让日本的一休和尚自称其为径山虚堂六世孙。径山虚堂的法脉在当今日本禅林发挥着主流的影响力。  宋代径山祖师，其禅道广大，其法脉幽远。  明朝末年，禅门已显衰微之相，被誉为明末四大高僧之一的紫柏大师，卓锡径山，倡印大藏经，以禅教互融重光祖印。历时两百年，字数达一亿的《径山藏》，成为了中国佛教史上的皇皇巨著。  明代的径山祖师行道艰辛，却奋志卓绝。  明代《径山志》里，一篇碑文的开篇这样说“径山，名为天下东南第一释寺。寺何以重？以道重也。”  无论是蕴道应缘，禅道广大，还是行道艰辛，1200年来的径山祖师念兹在兹，不离此道。双径单传佛祖心，钟鼓时宣妙法音。
              </div>
            </div>
          </div>
        </Space>
      </Content>
      {showFooter && (
        <footer style={{ backgroundColor: '#DAA520', textAlign: 'center', padding: '20px' }}>
          <div style={{ color: 'white', marginBottom: '10px' }}>
            @2024 powered by eagle-lab
          </div>
          <div style={{ color: 'white' }}>
            联系我们: xlz24@163.com
          </div>
        </footer>

      )}
    </Layout>
  );
}
