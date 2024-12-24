'use client'
import React, { useEffect, useState } from 'react';
import { Input, notification, Image, Space, List, Carousel } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getScriptureListRandom } from '@/lib/colophon';
import { getPrefaceAndPostscriptListRandom } from '@/lib/preface_and_postscript';
import { getIndividualRandom } from '@/lib/individual';
import RelationChart from '@/components/charts/RelationChart';
import { getByScriptureName, Graph } from '@/lib/graph_zang';
import { getGraphByName, getRandomPerson } from '@/lib/graph_zhi';
const { Search } = Input;


const Title: React.FC<{ text: string }> = ({ text }) => {
  return (
    <>
      <div className='flex items-center'>
        <img src="/decoration_l.svg" alt="Decoration Left" className='h-6 w-6 mr-2' />
        <div className='text-2xl'>{text}</div>
        <img src="/decoration_r.svg" alt="Decoration Right" className='h-6 w-6 ml-2' />
      </div>
      <div className='w-[90%] border-b mt-2 mb-8'
        style={{ borderColor: 'rgba(218, 165, 32, 0.4)' }}
      ></div>
    </>
  );
};

const SubTitle: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className='flex items-center m-6'>
      <img src="/decoration_f.svg" alt="Decoration Left" className='h-6 w-6' />
      <span className='text-lg text-white'>{text}</span>
    </div>
  )
};

interface dataSource {
  name: string;
  url: string;
}

interface ShowListProps {
  dataSource: dataSource[];
}

const ShowList: React.FC<ShowListProps> = ({ dataSource }) => {
  return (
    <List
      size="small"
      split={false}
      dataSource={dataSource}
      renderItem={(item) => (
        <List.Item>
          <Link className='text-white pl-4 truncate block w-full' href={item.url}>
            <span className='inline-block w-2.5 h-2.5 rounded-full bg-white mr-2'></span>
            {item.name}
          </Link>
        </List.Item>
      )}
    />
  );
};


export default function Page() {
  const router = useRouter();

  const [colophon, setColophon] = useState<dataSource[]>([]);
  const [preface, setPreface] = useState<dataSource[]>([]);
  const [individual, setIndividual] = useState<dataSource[]>([]);
  const [graph_ind_name, setGraphIndName] = useState<string>('')
  const [graph_individual, setGraphIndivudual] = useState<Graph>()
  const [graph_scripture, setGraphScripture] = useState<Graph>()
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

  const contentStyle = (imageUrl: string) => ({
    margin: 0,
    height: '70vh',
    minHeight: '500px',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage: `url(${imageUrl})`,
  });

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
    };

    handleResize(); // 初始化检查屏幕大小
    window.addEventListener('resize', handleResize);

    getScriptureListRandom(15).then((res) => {
      setColophon(res.data);
      getByScriptureName(res.data[0].name, 0, 10).then((res) => {
        if (res.graph) {
          setGraphScripture(res.graph);
        }
      });
    });

    getPrefaceAndPostscriptListRandom(15).then((res) => {
      setPreface(res.data)
    });

    getIndividualRandom(15).then((res) => {
      setIndividual(res.data)
    });

    getRandomPerson().then((res) => {
      setGraphIndName(res[0]["n.名号"])
      getGraphByName(res[0]["n.名号"]).then((res) => {
        setGraphIndivudual(res)
      })
    });
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div >
      <Carousel
        autoplay
        arrows
        autoplaySpeed={5000}
      >
        <div>
          <div style={contentStyle('/bg-1.jpg')}></div>
        </div>
        <div>
          <div style={contentStyle('/book1.jpg')}></div>
        </div>
      </Carousel>
      {contextHolder}
      <Content className="flex flex-col items-center">
        <Space direction="vertical" size="large" >
          <div
            className="relative flex flex-col items-center w-[100vw] h-[80vh] min-h-[700px]  bg-cover bg-center"
          >
            <div className="absolute w-2/5 flex flex-col items-center z-20"
              style={{
                marginTop: 'calc(min(200px, 20vh))'
              }}
            >
              <Image
                src="/天下径山.png"
                alt='天下径山'
                width="60%"
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
          </div>
          {/* 径山藏 */}
          <div className='flex flex-col items-center w-full max-w-[1200px] mx-auto'>
            <Title text='径山藏' />
            <div
              className={`w-full  flex ${isSmallScreen ? 'flex-col items-center' : 'justify-center'} gap-4`}
            >
              <div className={`h-[700px] relative ${isSmallScreen ? 'w-[90%]' : 'w-[30%]'} bg-[#1A2B5C] bg-opacity-80 rounded-lg shadow-lg`}>
                <SubTitle text="序跋" />
                <ShowList dataSource={preface} />
                <Link className='text-white text-opacity-70 absolute bottom-5 right-5 m-2' href={'/graph/scripture'}>更多&gt;&gt;</Link>
              </div>
              <div className={`h-[700px] relative ${isSmallScreen ? 'w-[90%]' : 'w-[30%]'} bg-[#1A2B5C] bg-opacity-80 rounded-lg shadow-lg`}>
                <SubTitle text="牌记" />
                <ShowList dataSource={colophon} />
                <Link className='text-white text-opacity-70 absolute bottom-5 right-5 m-2' href={'/overview/preface_and_postscript'}>更多&gt;&gt;</Link>
              </div>
              <div className={`h-[700px] relative ${isSmallScreen ? 'w-[90%]' : 'w-[30%]'} bg-[#1A2B5C] bg-opacity-80 rounded-lg shadow-lg`}>
                <SubTitle text="人物" />
                <ShowList dataSource={individual} />
                <Link className='text-white text-opacity-70 absolute bottom-5 right-5 m-2' href={'/overview/individual'}>更多&gt;&gt;</Link>
              </div>
            </div>
          </div>

          {/* 径山志 */}
          <div className='flex flex-col items-center max-w-[1200px] mx-auto min-h-[700px] max-h-[1000px]'>
            <Title text='径山志' />
            <div
              className={`w-full flex ${isSmallScreen ? 'flex-col items-center' : 'justify-center'} gap-4`}
            >
              <div className='h-[700px] w-[90%] bg-[#DAA520] bg-opacity-60 rounded-lg shadow-lg'>
                牌记
              </div>
            </div>
          </div>

          {/* 图谱*/}
          <div className='flex flex-col items-center max-w-[1200px] mx-auto'>
            <Title text='图谱' />
            <div
              className={`w-full flex ${isSmallScreen ? 'flex-col items-center' : 'justify-center'} gap-4`}
            >
              <div className={`h-[700px] ${isSmallScreen ? 'w-[90%]' : 'w-[45%]'} bg-gray-300 rounded-lg shadow-lg flex flex-col items-center`}>
                {colophon.length != 0 && <div className="w-full text-center mt-2">{colophon[0].name}</div>}
                <RelationChart graph={graph_scripture} layout='none' emphasis={true} zoom={0.8} />
              </div>
              <div className={`h-[700px] ${isSmallScreen ? 'w-[90%]' : 'w-[45%]'} bg-gray-300 rounded-lg shadow-lg flex flex-col items-center`}>
                <div className="w-full text-center mt-2">{graph_ind_name}</div>
                <RelationChart graph={graph_individual} layout='none' emphasis={true} zoom={0.8} />
              </div>
            </div>
          </div>

          {/* 缘起*/}
          <div className='flex flex-col items-center max-w-[1200px] mx-auto min-h-[700px] max-h-[1000px]'>
            <Title text='径山藏缘起' />
            <div
              className='w-[90%] h-[700px]'
              style={{
                backgroundImage: `url('/缘起bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <div className='bg-white bg-opacity-60 p-10 w-[70%]  flex justify-center items-center'
                style={{ fontSize: 'clamp(10px, 1.5vw, 15px)' }}
              >
                径山，在宋代文豪苏东坡的笔下“众峰来自天目山，势若骏马奔平川”，在元代住持楚石禅师的眼中“下方凤舞千山去，绝顶龙分两道来”，而明代四大高僧之一的紫柏大师，登径山不禁赞曰“双径萦回云雾深，五峰盘踞星辰簇,”。  名山胜景，待人而兴。  开山法钦禅师，在喝石岩畔结茅庐而勤行精进，池成水满月自来，道成则名震天下，唐代宗赐号“国一禅师”，朝中大臣32人皈依径山门下。  继之洪諲禅师，儒佛通达，法济四众。唐僖宗赐寺名“乾符镇国院”，唐昭宗赐洪諲禅师“法济大师”之号。吴越钱王更对洪諲禅师执弟子之礼而厚顾此山。  径山名声大震于唐五代之际，端赖于祖师净行林野，蕴道应缘。  宋代大慧禅师，中兴径山祖庭，再振临济宗风。参禅衲子云集径山千僧阁，拈提生命疑情，透脱三界牢关。大慧禅风以禅宗正脉广布天下禅林，绵邈于今而不衰。此因大慧禅师所证所传之道大，故其能摄者众。  虚堂禅师以广大愿，年届八旬，犹于径山凌霄峰前激扬妙义。道不分古今，地不分南北，他的一句“东海儿孙日转多”，让日本的一休和尚自称其为径山虚堂六世孙。径山虚堂的法脉在当今日本禅林发挥着主流的影响力。  宋代径山祖师，其禅道广大，其法脉幽远。  明朝末年，禅门已显衰微之相，被誉为明末四大高僧之一的紫柏大师，卓锡径山，倡印大藏经，以禅教互融重光祖印。历时两百年，字数达一亿的《径山藏》，成为了中国佛教史上的皇皇巨著。  明代的径山祖师行道艰辛，却奋志卓绝。  明代《径山志》里，一篇碑文的开篇这样说“径山，名为天下东南第一释寺。寺何以重？以道重也。”  无论是蕴道应缘，禅道广大，还是行道艰辛，1200年来的径山祖师念兹在兹，不离此道。双径单传佛祖心，钟鼓时宣妙法音。
              </div>
            </div>
          </div>
        </Space>
      </Content>
      <footer style={{ backgroundColor: '#DAA520', height: "30vh", maxHeight: "200px", marginTop: "20px" }}>
        {/* TODO:页脚内容 */}
        <div className=''>
          <div className='text-3xl font-semibold m-5'>
            <span className='text-black'>@2024 powered by</span> <span className='text-white'>eagle-lab</span>
          </div>
          {/* <div >
            联系我们: xlz24@163.com
          </div> */}
        </div>
      </footer>
    </div>
  );
}
