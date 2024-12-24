import React from 'react'

const content: string = `  径山，在宋代文豪苏东坡的笔下“众峰来自天目山，势若骏马奔平川”，在元代住持楚石禅师的眼中“下方凤舞千山去，绝顶龙分两道来”，而明代四大高僧之一的紫柏大师，登径山不禁赞曰“双径萦回云雾深，五峰盘踞星辰簇”。

名山胜景，待人而兴。

开山法钦禅师，在喝石岩畔结茅庐而勤行精进，池成水满月自来，道成则名震天下，唐代宗赐号“国一禅师”，朝中大臣32人皈依径山门下。

继之洪諲禅师，儒佛通达，法济四众。唐僖宗赐寺名“乾符镇国院”，唐昭宗赐洪諲禅师“法济大师”之号。吴越钱王更对洪諲禅师执弟子之礼而厚顾此山。

径山名声大震于唐五代之际，端赖于祖师净行林野，蕴道应缘。

宋代大慧禅师，中兴径山祖庭，再振临济宗风。参禅衲子云集径山千僧阁，拈提生命疑情，透脱三界牢关。大慧禅风以禅宗正脉广布天下禅林，绵邈于今而不衰。此因大慧禅师所证所传之道大，故其能摄者众。

虚堂禅师以广大愿，年届八旬，犹于径山凌霄峰前激扬妙义。道不分古今，地不分南北，他的一句“东海儿孙日转多”，让日本的一休和尚自称其为径山虚堂六世孙。径山虚堂的法脉在当今日本禅林发挥着主流的影响力。

宋代径山祖师，其禅道广大，其法脉幽远。

明朝末年，禅门已显衰微之相，被誉为明末四大高僧之一的紫柏大师，卓锡径山，倡印大藏经，以禅教互融重光祖印。历时两百年，字数达一亿的《径山藏》，成为了中国佛教史上的皇皇巨著。

明代的径山祖师行道艰辛，却奋志卓绝。

明代《径山志》里，一篇碑文的开篇这样说“径山，名为天下东南第一释寺。寺何以重？以道重也。”

无论是蕴道应缘，禅道广大，还是行道艰辛，1200年来的径山祖师念兹在兹，不离此道。双径单传佛祖心，钟鼓时宣妙法音。`

export default function Page() {
  return (
    <div className="relative h-full bg-[url('/bg-1.jpg')] bg-cover bg-fixed">
      <div className="absolute inset-0 bg-yellow-100 opacity-30"></div>
      <div className="flex flex-col items-center justify-start pt-16 h-full overflow-auto relative">
        <div className="mt-20 w-3/4 mx-auto my-5 py-8 px-12 bg-[#faf8f5] rounded-lg shadow-md z-9 max-w-[1200px]">
          <h2 className="text-[#1A2B5C] text-4xl text-center">径山藏缘起</h2>
          <hr className="my-2 border-0 h-0.5 bg-[#987444]" />
          <div className="whitespace-pre-line text-[#535251]" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  )
}
