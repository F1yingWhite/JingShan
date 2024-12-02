'use client'
import React, { useEffect, useState } from 'react'
import { Flex, Input, Layout } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
const { Header } = Layout;

interface NavIconProps {
  href: string;
  svgPath: string;
  text: string;
}

const NavIcon: React.FC<NavIconProps> = ({ href, svgPath, text }) => {
  const path = usePathname();
  const isCurrentPath =
    path === href || (path.startsWith(href) && (path === href || path[href.length] === '/'));
  const textColor = isCurrentPath ? 'text-[#8B4513]' : 'text-[#9f8a65]';
  const hoverColor = 'hover:text-[#a69e56]';

  return (
    <Link href={href} className={`mx-4 flex flex-col items-center justify-center text-xs sm:text-xs md:text-sm lg:text-base pt-1 ${textColor} ${hoverColor}`}>
      <svg
        className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" // 调整图标大小
        fill="currentColor"
        viewBox="0 0 1186 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={svgPath} />
      </svg>
      <span className="text-center">{text}</span>
    </Link>
  );
};

const IconList: NavIconProps[] = [
  {
    href: "/",
    svgPath: "M592.979172 99.298087C764.545352 247.565155 1107.6777 544.099291 1107.6777 544.099291 1127.383121 561.128658 1157.162536 558.959296 1174.191903 539.253885 1191.221271 519.548473 1189.051915 489.76905 1169.346507 472.739683L644.064741 18.792487C615.090477-6.247004 570.577796-6.245391 541.605404 18.792487L16.323639 472.739683C-3.381769 489.76905-5.551125 519.548473 11.478242 539.253885 28.50761 558.959296 58.287024 561.128658 77.992446 544.099291 77.992446 544.099291 590.438069 97.102073 592.979172 99.298087L592.979172 99.298087ZM249.34468 1017.263247 451.27768 1017.263247C481.089363 1017.263247 505.25651 993.204509 505.25651 963.284413L505.25651 707.372587 680.4121 707.372587 680.4121 963.284413C680.4121 993.0961 704.63663 1017.263247 734.344069 1017.263247L949.844297 1017.263247C979.630098 1017.263247 1003.776266 993.112147 1003.776266 963.461138L1003.776266 545.711842C1003.776266 519.655814 982.610236 498.53323 956.618992 498.53323 930.574743 498.53323 909.461718 519.580059 909.461718 545.574717L909.461718 922.948698 774.726648 922.948698 774.726648 667.036873C774.726648 637.225185 750.648346 613.058039 720.758247 613.058039L464.910363 613.058039C435.104446 613.058039 410.941961 637.116776 410.941961 667.036873L410.941961 922.948698 289.680399 922.948698 289.680399 545.574717C289.680399 519.59442 268.514368 498.53323 242.523125 498.53323 216.478876 498.53323 195.36585 519.672553 195.36585 545.711842L195.36585 963.461138C195.36585 993.175222 219.424589 1017.263247 249.34468 1017.263247Z",
    text: "主页"
  },
  {
    href: "/overview",
    svgPath: "M832 25.6H192c-51.2 0-83.2 38.4-83.2 89.6v800c0 51.2 38.4 83.2 83.2 83.2h640c51.2 0 83.2-38.4 83.2-83.2V115.2c0-51.2-32-89.6-83.2-89.6zM256 742.4c-12.8 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6 25.6 12.8 25.6 25.6-12.8 25.6-25.6 25.6z m0-224c-25.6 0-38.4-12.8-38.4-25.6s12.8-25.6 25.6-25.6 25.6 12.8 25.6 25.6 0 25.6-12.8 25.6z m0-224c-12.8 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6 25.6 12.8 25.6 25.6-12.8 25.6-25.6 25.6z m524.8 448H416c-12.8 0-38.4-12.8-38.4-38.4 0-12.8 12.8-38.4 38.4-38.4h371.2c12.8 0 38.4 12.8 38.4 38.4-6.4 25.6-19.2 38.4-44.8 38.4z m0-224H416c-25.6 0-38.4-12.8-38.4-25.6s12.8-38.4 38.4-38.4h371.2c12.8 0 38.4 12.8 38.4 38.4-6.4 25.6-19.2 25.6-44.8 25.6z m0-224H416c-12.8 0-38.4-12.8-38.4-38.4 0-12.8 12.8-38.4 38.4-38.4h371.2c12.8 0 38.4 12.8 38.4 38.4s-19.2 38.4-44.8 38.4zz",
    text: "总览"
  },
  {
    href: "/graph",
    svgPath: "M746.666667 128a149.333333 149.333333 0 1 1-73.642667 279.296l-15.488 15.488c15.914667 25.941333 25.130667 56.490667 25.130667 89.216 0 29.525333-7.509333 57.301333-20.693334 81.493333l56.405334 56.490667a128 128 0 1 1-63.232 57.557333l-51.456-51.541333A169.856 169.856 0 0 1 512 682.666667c-19.712 0-38.656-3.328-56.32-9.514667l-46.336 46.336a149.333333 149.333333 0 1 1-59.776-60.885333l34.090667-34.133334A170.026667 170.026667 0 0 1 341.333333 512c0-33.365333 9.557333-64.426667 26.112-90.752L315.562667 369.322667a128 128 0 1 1 58.026666-62.634667l55.893334 55.893333A169.898667 169.898667 0 0 1 512 341.333333c30.592 0 59.306667 8.064 84.096 22.144l17.792-17.749333A149.333333 149.333333 0 0 1 746.666667 128z m-469.333334 597.333333a64 64 0 1 0 0 128 64 64 0 0 0 0-128zM768 725.333333a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z m-256-298.666666a85.333333 85.333333 0 1 0 0 170.666666 85.333333 85.333333 0 0 0 0-170.666666z m234.666667-213.333334a64 64 0 1 0 0 128 64 64 0 0 0 0-128zM256 213.333333a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z",
    text: "图谱"
  },
  {
    href: "/dependent",
    svgPath: "M448.000226 735.853809H344.008946c-27.021043 0-53.977062-5.8955-80.11667-17.700951-25.287072-11.415307-49.327854-28.292622-69.517775-48.887136-20.663151-21.078581-36.962475-45.224123-48.442806-71.811673-11.921048-27.595421-17.957434-56.354047-17.957434-85.470305S134.021484 454.10886 145.942533 426.513439c11.480331-26.583938 27.779655-50.751154 48.442806-71.829736 20.189921-20.590902 44.230702-37.544078 69.517774-48.959384 26.139608-11.801838 53.102852-17.812936 80.116671-17.812937h103.991279a31.970084 31.970084 0 0 0 0-63.940169h-104.002117c-36.153289 0-71.963396 7.918466-106.426063 23.480853-32.912931 14.857961-62.813088 35.882356-88.865997 62.462682-26.190182 26.732048-46.875007 57.437779-61.483711 91.250207-15.392602 35.643935-23.199083 72.938754-23.199083 110.833239s7.806481 75.185691 23.199083 110.833238c14.608703 33.830491 35.297141 64.528997 61.483711 91.242983 26.056522 26.580326 55.956679 47.503572 88.865997 62.361533 34.462667 15.558774 70.269162 23.35803 106.426063 23.35803h103.99128a31.970084 31.970084 0 1 0 0-63.940169zM936.770437 401.168568c-14.608703-33.830491-35.293528-64.528997-61.48371-91.242983-26.056522-26.580326-55.956679-47.622782-88.865998-62.495193-34.462667-15.558774-70.272774-23.480853-106.426063-23.480853h-103.994892a31.970084 31.970084 0 0 0 0 63.940169h103.99128c27.021043 0 53.977062 6.011098 80.11667 17.812936 25.287072 11.415307 49.327854 28.350421 69.517775 48.948548 20.663151 21.078581 36.962475 45.253022 48.442806 71.840572 11.921048 27.595421 17.957434 56.354047 17.957434 85.484755s-6.04361 57.889334-17.957434 85.481142c-11.480331 26.583938-27.779655 50.754767-48.442806 71.833348-20.189921 20.590902-44.230702 37.42848-69.517775 48.843787-26.139608 11.801838-53.102852 17.700951-80.11667 17.700951h-103.99128a31.970084 31.970084 0 0 0 0 63.940169h103.99128c36.153289 0 71.963396-7.799256 106.426063-23.35803 32.912931-14.857961 62.813088-35.824557 88.865997-62.404883 26.190182-26.732048 46.875007-57.390817 61.483711-91.221307 15.392602-35.643935 23.199083-72.924305 23.199083-110.818789s-7.802868-75.156792-23.195471-110.804339z",
    text: "缘起"
  },
  {
    href: "/chat",
    svgPath: "M948.8896 408.6784c-14.1312 0-25.6 11.4688-25.6 25.6v43.008c0 54.6304-38.5024 99.7888-88.2176 106.7008V471.552c0-114.2784-89.1392-207.2064-198.656-207.2064H294.5536v-1.792c0-59.392 45.5168-107.7248 101.4784-107.7248h425.8304c55.9616 0 101.4784 48.3328 101.4784 107.7248 0 14.1312 11.4688 25.6 25.6 25.6s25.6-11.4688 25.6-25.6c0-87.6544-68.5056-158.9248-152.6784-158.9248H395.9808c-84.1728 0-152.6784 71.3216-152.6784 158.9248v2.3552c-103.0656 7.4752-184.7808 97.28-184.7808 206.6432v166.5024c0 105.1648 75.4688 192.256 172.9024 205.4656l-0.512 71.7824c-0.0512 8.8064 4.4544 17.0496 11.8784 21.8112 4.1472 2.6624 8.96 3.9936 13.7216 3.9936 3.7888 0 7.5776-0.8192 11.0592-2.5088l194.6112-93.3376h174.1312c109.568 0 198.656-92.9792 198.656-207.2064v-2.4064c77.9776-7.0144 139.4176-75.3152 139.4176-158.3104v-43.008a25.46688 25.46688 0 0 0-25.4976-25.6512z m-165.0176 229.3248c0 86.016-66.1504 156.0064-147.456 156.0064H456.448c-3.84 0-7.6288 0.8704-11.0592 2.5088l-162.9184 78.1312 0.4096-54.8352a25.63072 25.63072 0 0 0-25.6-25.8048c-81.3056 0-147.5072-69.9904-147.5072-156.0064V471.552c0-86.016 66.1504-156.0064 147.5072-156.0064h379.136c81.3056 0 147.456 69.9904 147.456 156.0064v166.4512z",
    text: "对话"
  }
]

export default function NavBar() {
  const path = usePathname();
  const headerStyle = {
    backgroundColor: '#f4f1ea',
    backgroundImage: path !== '/' ? 'url(/navBg.png)' : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: 0,
  };
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');


  useEffect(() => {
    const segments = path.split('/');
    if (segments[1] === 'search' && segments[2]) {
      setSearchValue(decodeURIComponent(segments[2]));
    } else {
      setSearchValue('');
    }
  }, [path]);


  const handleSearch = (value: string) => {
    value = encodeURIComponent(value);
    router.push(`/search/${value}/hybrid`);
  }

  return (
    <Header style={headerStyle} className={`flex items-center justify-between ${path === '/' ? '' : 'shadow-md'}`}>
      <Flex justify="start" className='items-center text-2xl font-bold text-black ml-0'>
        <Image src="/佛经.svg" alt='佛经' width={50} height={50} />
        <span
          className='ml-2 text-base sm:block hidden md:text-xl lg:text-2xl'
          onClick={() => { router.push(`/`) }}
        >
          求是佛典
        </span>
      </Flex>

      <Flex justify="center" className="flex-1">
        <div className="w-2/5 max-w-[300px] hidden sm:flex justify-center">
          {path !== '/' && (
            <Input.Search
              className="w-full"
              placeholder="搜索..."
              value={searchValue}
              onSearch={(value) => handleSearch(value)}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          )}
        </div>
      </Flex>

      <Flex justify="center">
        {IconList.map((icon, index) => (
          <NavIcon key={index} href={icon.href} svgPath={icon.svgPath} text={icon.text} />
        ))}
      </Flex>
    </Header>
  );
}