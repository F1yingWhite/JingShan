'use client'
import React from 'react'
import { Flex, Layout } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const textColor = isCurrentPath ?  'text-[#8B4513]':'text-[#9f8a65]' ;
  const hoverColor = 'hover:text-[#a69e56]';

  return (
    <Link href={href} className={`mx-4 flex flex-col items-center text-xs pt-1 ${textColor} ${hoverColor}`}>
      <svg
        width="25"
        height="25"
        fill="currentColor"
        viewBox="0 0 1186 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={svgPath} />
      </svg>
      <span>{text}</span>
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
    href: "/dependent",
    svgPath: "M448.000226 735.853809H344.008946c-27.021043 0-53.977062-5.8955-80.11667-17.700951-25.287072-11.415307-49.327854-28.292622-69.517775-48.887136-20.663151-21.078581-36.962475-45.224123-48.442806-71.811673-11.921048-27.595421-17.957434-56.354047-17.957434-85.470305S134.021484 454.10886 145.942533 426.513439c11.480331-26.583938 27.779655-50.751154 48.442806-71.829736 20.189921-20.590902 44.230702-37.544078 69.517774-48.959384 26.139608-11.801838 53.102852-17.812936 80.116671-17.812937h103.991279a31.970084 31.970084 0 0 0 0-63.940169h-104.002117c-36.153289 0-71.963396 7.918466-106.426063 23.480853-32.912931 14.857961-62.813088 35.882356-88.865997 62.462682-26.190182 26.732048-46.875007 57.437779-61.483711 91.250207-15.392602 35.643935-23.199083 72.938754-23.199083 110.833239s7.806481 75.185691 23.199083 110.833238c14.608703 33.830491 35.297141 64.528997 61.483711 91.242983 26.056522 26.580326 55.956679 47.503572 88.865997 62.361533 34.462667 15.558774 70.269162 23.35803 106.426063 23.35803h103.99128a31.970084 31.970084 0 1 0 0-63.940169zM936.770437 401.168568c-14.608703-33.830491-35.293528-64.528997-61.48371-91.242983-26.056522-26.580326-55.956679-47.622782-88.865998-62.495193-34.462667-15.558774-70.272774-23.480853-106.426063-23.480853h-103.994892a31.970084 31.970084 0 0 0 0 63.940169h103.99128c27.021043 0 53.977062 6.011098 80.11667 17.812936 25.287072 11.415307 49.327854 28.350421 69.517775 48.948548 20.663151 21.078581 36.962475 45.253022 48.442806 71.840572 11.921048 27.595421 17.957434 56.354047 17.957434 85.484755s-6.04361 57.889334-17.957434 85.481142c-11.480331 26.583938-27.779655 50.754767-48.442806 71.833348-20.189921 20.590902-44.230702 37.42848-69.517775 48.843787-26.139608 11.801838-53.102852 17.700951-80.11667 17.700951h-103.99128a31.970084 31.970084 0 0 0 0 63.940169h103.99128c36.153289 0 71.963396-7.799256 106.426063-23.35803 32.912931-14.857961 62.813088-35.824557 88.865997-62.404883 26.190182-26.732048 46.875007-57.390817 61.483711-91.221307 15.392602-35.643935 23.199083-72.924305 23.199083-110.818789s-7.802868-75.156792-23.195471-110.804339z",
    text: "缘起"
  }
]

export default function NavBar() {
  const path = usePathname();
  const headerStyle = {
    backgroundColor: '#f4f1ea',
    backgroundImage: path !== '/' ? 'url(/navBg.png)' : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: 0
  };

  return (
    <Header style={headerStyle} className='flex items-center justify-between p-0'>
      <Flex justify="start" className='items-center text-2xl font-bold text-black ml-0'>
        <Image src="/佛经.svg" alt='佛经' width={50} height={50} />
        <span className='ml-2'>求是佛典</span>
      </Flex>
      <Flex justify="center">
        {IconList.map((icon, index) => (
          <NavIcon key={index} href={icon.href} svgPath={icon.svgPath} text={icon.text} />
        ))}
      </Flex>
    </Header>

  )
}
