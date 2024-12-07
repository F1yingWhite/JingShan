'use client'
import { ConfigProvider, Layout } from "antd";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import NavBar from "@/components/NavBar";
import { Content } from "antd/es/layout/layout";
import { Noto_Sans_SC } from "next/font/google";
import Script from "next/script";
import { fetch_user } from "@/lib/user";
import { useEffect } from "react";
import { useUserStore } from "@/store/useStore";

const noto_sans_sc = Noto_Sans_SC({
  display: 'swap',
  subsets: ['vietnamese'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setUser,user } = useUserStore();
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    console.log(jwt)
    if (!jwt) return;
    fetch_user().then((res) => {
      setUser(res)
    }).catch((err) => {
      localStorage.removeItem('jwt')
    })
  }, [])
  return (
    <html lang="cn">
      <body className={noto_sans_sc.className}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#8d7651',
                borderRadius: 5,
              },
            }}
          >
            <Layout className="h-screen">
              <div className="fixed top-0 left-0 w-full z-10">
                <NavBar />
              </div>
              <Content className="mt-16">
                {children}
              </Content>
            </Layout>
          </ConfigProvider>
        </AntdRegistry>
        <Script src="/Core/live2dcubismcore.js" strategy='beforeInteractive' />
      </body>
    </html>
  );
}
