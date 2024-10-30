import { ConfigProvider, Layout, theme } from "antd";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import NavBar from "@/components/NavBar";
import { Content } from "antd/es/layout/layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#A1845A',
                borderRadius: 5,
                colorText: '#FFFFFF',
                colorBgContainer: '#A1845A',
              },
            }}
          >
            <Layout className="h-screen">
              <NavBar />
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
