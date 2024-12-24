import React from 'react'

export default function Page() {
  return (
    <div className="relative h-full bg-[url('/bg-1.jpg')] bg-cover bg-fixed">
      <div className="absolute inset-0 bg-yellow-100 opacity-30"></div>
      <div className="flex flex-col items-center justify-start pt-16 h-full overflow-auto relative">
        <div className="mt-20 w-3/4 mx-auto my-5 py-8 px-12 bg-[#faf8f5] rounded-lg shadow-md z-9 max-w-[1200px]">
          <h2 className="text-[#1A2B5C] text-2xl text-center">《径山藏》数字化研发建设之缘起——佛典文本的数字研究与保护传承</h2>
          <hr className="my-2 border-0 h-0.5 bg-[#987444]" />
          <div className="whitespace-pre-line text-[#535251] leading-loose">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;《径山藏》又名《嘉兴藏》、《方册藏》，是我国近代编纂刊印的大藏经中收录内容最多的一部，其大量收录了先前的大藏经未曾收录的佛教典籍，内容包括正藏、续藏和又续藏。同时，它又是我国第一部方册本大藏经，标志着经本形式的改革，是佛经向现代化过渡的呈现。<br /><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;《径山藏》的刊刻从晚明至清中期，先后持续两百多年，由明末四大高僧之一的紫柏真可大师发起刊刻、大力倡导下，并与其弟子密藏道开、幻余法本、法铠、冯梦祯、管志道等人发起倡议并主持，等近十代僧徒大德的努力，由民间集资刻造的大藏经，也是我国第一部方册本大藏经。刻藏事业始于万历十七年（1589）山西五台山妙德庵，后因山上环境过于寒苦，物资交通运输困难，募缘不易，故在万历二十二年（1594）南迁至径山寺继续刊刻。<br /><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;此后刻藏主事者几经变更，幸赖外护诸公的护持协助，紫柏法孙念云兴勤担任寂照庵经坊主，继承刻藏事业，为期十年。此间，念公迎请缪希雍前来管理刻场事务，偕同法侣众人商榷准绳、制订规约，使刻藏工程步入正轨。此后，又有紫柏弟子澹居法铠受请驻锡径山下院化城寺，主持刻经场，又是另一个十年。持续了两百余年刻藏大业，为中国佛教汉文大藏经历史谱写下了浓墨重彩的一页，使得《径山藏》成为珍贵的佛教文化遗产。<br /><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;《径山藏》的刊刻，亦为径山佛教文化史上具有划时代意义的大事，是径山寺史的文化丰碑。自2019年12月9日举办“第三届径山禅宗祖庭文化论坛暨径山藏经楼落成庆典”，宣告新建藏经楼的启用，在善信们的鼎力捐助下，征集到珍贵的《径山藏》古籍善本，径山禅寺近年来倾力于藏经古籍的保护与整编。<br /><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2022年至2023年由于义工们的发心，将径山寺藏经阁的古籍《径山藏》全部扫描，共计完成450册27751拍的数字化扫描任务。随后，在浙江大学计算机系师生们的助力下，藉以扫描文件为底本，研发了《径山寺藏古籍检索系统》，通过资讯技术，既有效的保护古籍，亦促进佛典的广泛且便捷地阅读。<br /><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024年8月，进一步结合人工智能数字化的应用，挖掘《径山藏》相关序跋、题记等史料文献，开发基于《径山藏》人物传记文本脉络的智能分析系统，或可进而建构出明清佛教藏经的知识图谱，希望在今日数字化的时代下，为教界、学界提供珍贵的佛典数字资源。<br /><br />
          </div>
        </div>
      </div>
    </div>
  );
}