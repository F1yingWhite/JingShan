import { ConfigProvider, Layout, theme } from "antd";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import NavBar from "@/components/NavBar";
import { Content } from "antd/es/layout/layout";
import { Noto_Sans_SC } from "next/font/google"

const noto_sans_sc = Noto_Sans_SC({
  display: 'swap',
  subsets: ['vietnamese'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <div className=" w-full z-10">
                <NavBar />
              </div>
              <Content >
                {children}
              </Content>
            </Layout>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html >
  );
}
