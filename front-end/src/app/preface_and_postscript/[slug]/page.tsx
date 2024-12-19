'use client'
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Image, message, Space, Spin } from 'antd';
import { getPdf } from '@/lib/pdf';
import { getPrefaceAndPostscriptById, getPrefaceAndPostscriptTitleList, PrefaceAndPostscript, putPrefaceAndPostscript } from '@/lib/preface_and_postscript';
import { EditOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Tag from '@/components/Tag';
import ScollList from '@/components/ScrollList';
import { useUserStore } from '@/store/useStore';
import { ModalForm, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { MessageInstance } from 'antd/es/message/interface';

const PrefaceEditForm = ({ preface, setPreface, messageApi }: { preface: PrefaceAndPostscript, setPreface: React.Dispatch<React.SetStateAction<PrefaceAndPostscript>>, messageApi: MessageInstance }) => {
  const [form] = Form.useForm<PrefaceAndPostscript>();
  return (
    <ModalForm<PrefaceAndPostscript>
      title="修改序跋信息"
      initialValues={preface}
      trigger={
        <Button icon={<EditOutlined />}>修改</Button>
      }
      form={form}
      autoFocusFirstInput
      submitTimeout={3000}
      onFinish={async (values) => {
        values.last_modify = preface.last_modify
        putPrefaceAndPostscript(preface.id, values).then(() => {
          messageApi.success('修改成功');
          getPrefaceAndPostscriptById(preface.id).then((res) => {
            setPreface(res);
          })
        }).catch((err) => {
          if (err.status === 403) {
            messageApi.error('权限不足');
          } else if (err.response.data.detail === "Last modify time not match") {
            messageApi.error('数据已被修改，请刷新页面后重试');
          } else {
            messageApi.error('修改失败');
          }
        });
        return true;
      }}
    >
      <ProForm.Group>
        <ProFormText
          name="title"
          label="篇名"
          width="md"
          placeholder="请输入篇名"
        />
        <ProFormText
          name="classic"
          width="md"
          label="典籍"
          placeholder="请输入典籍"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="author"
          label="作者"
          placeholder="请输入作者"
        />
        <ProFormText
          width="md"
          name="translator"
          label="译者"
          placeholder="请输入译者"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="category"
          label="类别"
          placeholder="请输入类别"
        />
        <ProFormText
          width="md"
          name="dynasty"
          label="朝代"
          placeholder="请输入朝代"
        />
      </ProForm.Group>
    </ModalForm>
  );
};


export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const [preface_and_postscript, setPrefaceAndPostscript] = useState<PrefaceAndPostscript>();
  const router = useRouter();
  const { user } = useUserStore();
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: PrefaceAndPostscript = await getPrefaceAndPostscriptById(+slug);
        setPrefaceAndPostscript(res);
        const res2 = await getPdf('preface_and_postscript', res.copy_id, res.page_id);
        setPdfPage(`data:image/jpeg;base64,${res2.image}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData().then(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }, [slug]);

  useEffect(() => {
    const leftDiv = document.getElementById("leftDiv");
    const rightDiv = document.getElementById("rightDiv");

    const adjustHeight = () => {
      const rightDivHeight = rightDiv.offsetHeight;
      const computedHeight = Math.max(window.innerHeight * 1.1, rightDivHeight);
      leftDiv.style.height = `${computedHeight}px`;
    };
    window.addEventListener("resize", adjustHeight);
    adjustHeight();
    return () => window.removeEventListener("resize", adjustHeight);
  }, []);

  return (
    <div className="flex h-full flex-col max-w-[1200px] mx-auto">
      {contextHolder}
      {+slug > 1 && (
        <Button
          className="rounded-full"
          onClick={() => router.push(`/preface_and_postscript/${+slug - 1}`)}
          icon={<LeftOutlined style={{ color: 'white' }} />}
          style={{ position: 'fixed', top: '50%', left: '30px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
        />
      )}
      {+slug < 4777 && (
        <Button
          className="rounded-full"
          onClick={() => router.push(`/preface_and_postscript/${+slug + 1}`)}
          icon={<RightOutlined style={{ color: 'white' }} />}
          style={{ position: 'fixed', top: '50%', right: '30px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
        />
      )}
      <div className='p-8'>
        <Breadcrumb
          separator={<div className='text-lg'>&gt;&gt;</div>}
          items={[
            {
              title: <a href='/' className='text-lg'>主页</a>,
            },
            {
              title: <a href="" className='text-lg'>径山藏</a>,
            },
            {
              title: <a href="/overview/preface_and_postscript" className='text-lg'>序跋</a>,
            }
          ]}
        />
      </div>
      <div className="w-full flex flex-col md:flex-row">
        <div
          className="hidden lg:block w-1/5 pl-8"
          id="leftDiv"
        >
          <ScollList loadDataApi={getPrefaceAndPostscriptTitleList} title='序跋篇名' />
        </div>
        <div className="w-full md:w-2/3 lg:w-2/5 p-8" id="rightDiv">
          {preface_and_postscript && (
            <div>
              <div className="flex items-center gap-4 pb-8">
                <Tag text="序跋" color="#1A2B5C" opacity={0.7} />
                <div className='text-4xl font-bold'>
                  {preface_and_postscript.title}
                </div>
                {
                  user && user.privilege > 0 && (
                    <PrefaceEditForm preface={preface_and_postscript} setPreface={setPrefaceAndPostscript} messageApi={message} />
                  )
                }
              </div>
              <div className='flex pl-2' style={{ alignItems: 'flex-start' }}>
                {[
                  { label: "篇名", value: preface_and_postscript.title },
                  { label: "典籍", value: preface_and_postscript.classic },
                  { label: "作者", value: preface_and_postscript.author },
                  { label: "译者", value: preface_and_postscript.translator },
                  { label: "类别", value: preface_and_postscript.category },
                  { label: "朝代", value: preface_and_postscript.dynasty },
                  // { label: "册", value: preface_and_postscript.copy_id },
                  // { label: "页", value: preface_and_postscript.page_id },
                  // ...(user && user.privilege > 0 ? [{ label: "上次修改", value:preface_and_postscript.last_modify }] : [])
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-1 flex flex-col"
                    style={{
                      alignItems: "center",
                      flexGrow: 1,
                      textAlign: "center"
                    }}
                  >
                    <div style={{ writingMode: "vertical-rl" }}>
                      <Tag text={item.label} color="#DAA520" opacity={0.2} textColor="black" />
                    </div>
                    <div className="pt-2" style={{ writingMode: "vertical-rl", textOrientation: "upright" }}>
                      {item.value || "未知"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/3 overflow-auto">
          {pdfPage ? (
            <Image src={pdfPage} alt={`Page ${slug}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
          ) : (
            <div className="flex justify-center items-center" style={{ height: '100%', width: '100%' }}>
              <Spin />
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
