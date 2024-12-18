'use client'
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Image, message, Spin } from 'antd';
import { getPdf } from '@/lib/pdf';
import { getColophonById, Colophon, putColophon, RelatedIndividual, updateRelatedIndividual } from '@/lib/colophon';
import { EditOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ProTable, { EditableProTable, ProColumns } from '@ant-design/pro-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Tag from '@/components/Tag';
import { useUserStore } from '@/store/useStore';
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { MessageInstance } from 'antd/es/message/interface';

const ColophonEditForm = ({ colophon, setColophon, messageApi }: { colophon: Colophon, setColophon: React.Dispatch<React.SetStateAction<Colophon>>, messageApi: MessageInstance }) => {
  const [form] = Form.useForm<Colophon>();
  return (
    <ModalForm<Colophon>
      title="修改牌记信息"
      initialValues={colophon}
      trigger={
        <Button icon={<EditOutlined />}>修改</Button>
      }
      form={form}
      autoFocusFirstInput
      submitTimeout={5000}
      onFinish={async (values) => {
        values.last_modify = colophon.last_modify
        putColophon(colophon.id, values).then(() => {
          messageApi.success('修改成功');
          getColophonById(colophon.id).then((res) => {
            setColophon(res);
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
          name="scripture_name"
          label="牌记名"
          width="md"
          placeholder="请输入牌记名" />
        <ProFormText
          name="qianziwen"
          width="md"
          label="千字文"
          placeholder="请输入千字文"
        />
      </ProForm.Group>
      <ProFormTextArea
        colProps={{ span: 24 }}
        name="content"
        label="牌记"
        placeholder="输入牌记内容"
      />
      <ProForm.Group>
        <ProFormText
          width="md"
          name="time"
          label="刊刻时间"
          placeholder="请输入刊刻时间"
        />
        <ProFormText
          width="md"
          name="place"
          label="刊刻地点"
          placeholder="请输入刊刻地点"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="words_num"
          label="记字"
          placeholder="请输入记字"
        />
        <ProFormText
          name="money"
          width="md"
          label="该银"
          placeholder="请输入该银"
        />
      </ProForm.Group>
    </ModalForm>
  );
};

const IndividualEditForm = ({ colophon, setColophon, messageApi }: { colophon: Colophon, setColophon: React.Dispatch<React.SetStateAction<Colophon>>, messageApi: MessageInstance }) => {
  const [form] = Form.useForm<RelatedIndividual[]>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    colophon.related_individuals ? colophon.related_individuals.map((item) => item.id) : [],
  );
  const columns: ProColumns<RelatedIndividual>[] = [
    {
      title: '人名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地点',
      key: 'place',
      dataIndex: 'place',
    },
    {
      title: '活动',
      dataIndex: 'type',
      key: 'type',
      valueType: 'select',
      valueEnum: {
        刻工: { text: '刻工', status: '刻工' },
        书: { text: '书', status: '书' },
        对: { text: '对', status: '对' },
        募: { text: '募', status: '募' },
      },
    },
    {
      title: '备注',
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: '操作',
      valueType: 'option',
    },
  ];

  return (
    <ModalForm<RelatedIndividual[]> title="修改牌记信息"
      initialValues={colophon}
      trigger={
        <Button icon={<EditOutlined />}>修改</Button>
      }
      form={form}
      autoFocusFirstInput
      submitTimeout={5000}
      onFinish={async (values) => {
        updateRelatedIndividual(colophon.id, values.dataSource).then(() => {
          messageApi.success('修改成功');
          getColophonById(colophon.id).then((res) => {
            setColophon(res);
          });
        }).catch((err) => {
          if (err.status === 403) {
            messageApi.error('权限不足');
          } else {
            messageApi.error('修改失败');
          }
        });
        return true;
      }}
    >
      <ProForm.Item
        label="相关人物列表"
        name="dataSource"
        initialValue={colophon.related_individuals}
        trigger="onValuesChange"
      >
        <EditableProTable<RelatedIndividual>
          rowKey="id"
          toolBarRender={false}
          columns={columns}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            position: 'bottom',
            record: (index, dataSource) => ({
              id: dataSource ? 1 : dataSource.length + 1,
              name: "",
              place: "",
              type: "",
              note: "",
            }),
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            onChange: setEditableRowKeys,
            actionRender: (row, _, dom) => {
              return [dom.delete];
            },
          }}
        />
      </ProForm.Item>
    </ModalForm >
  )
}

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const [colophon, setColophon] = useState<Colophon>();
  const [pdf_id, setPdfId] = useState<number>(0);
  const router = useRouter();
  const { user } = useUserStore()
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: Colophon = await getColophonById(+slug);
        setColophon(res);
        setPdfId(res.pdf_id);
        const page = res.page_id;
        const res2 = await getPdf('colophon', res.pdf_id, page);
        const pdfBase64 = res2.image;
        setPdfPage(`data:image/jpeg;base64,${pdfBase64}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [slug]);


  return (
    <div className="flex h-full flex-col max-w-[1200px] mx-auto">
      {contextHolder}
      {
        +slug > 1 &&
        <Button
          className="rounded-full"
          onClick={() => { router.push(`/colophon/${+slug - 1}`) }}
          icon={<LeftOutlined style={{ color: 'white' }} />}
          style={{ position: 'fixed', top: '50%', left: '30px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
        />
      }
      {
        +slug < 9160 &&
        <Button
          onClick={() => { router.push(`/colophon/${+slug + 1}`) }}
          icon={<RightOutlined style={{ color: 'white' }} />}
          style={{ position: 'fixed', top: '50%', right: '30px', transform: 'translateY(-50%)', zIndex: 9, backgroundColor: "#1A2B5C", borderRadius: "9999px" }}
        />
      }
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
              title: <a href="/overview/colophon" className='text-lg'>牌记</a>,
            }
          ]}
        />
      </div>
      <div className="w-full flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 pl-8 pr-8">
          {colophon && (
            <div>
              <div className="flex items-center gap-4">
                <Tag text="牌记" color="#1A2B5C" opacity={0.7} />
                <div className='text-4xl font-bold'>
                  {colophon.scripture_name}
                </div>
                {
                  user && user.privilege > 0 && (
                    <ColophonEditForm colophon={colophon} setColophon={setColophon} messageApi={messageApi} />
                  )
                }
              </div>
              <p className="mb-6 mt-6 leading-relaxed">{colophon.content}</p>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: "经名", value: colophon.scripture_name },
                  { label: "卷数", value: colophon.volume_id },
                  { label: "册数", value: colophon.chapter_id },
                  { label: "千字文", value: colophon.qianziwen },
                  { label: "刊刻时间", value: colophon.time },
                  { label: "刊刻地点", value: colophon.place },
                  { label: "计字", value: colophon.words_num },
                  { label: "该银", value: colophon.money },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Tag text={item.label} color="#DAA520" opacity={0.2} textColor='black' />
                    <div className="text-right">
                      {item.value || "未知"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
          }
        </div >
        <div className="w-full md:w-1/3 overflow-auto">
          {pdfPage ? (
            <Image src={pdfPage} alt={`Page ${slug}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
          ) : (
            <div className="flex justify-center items-center" style={{ height: '100%', width: '100%' }}>
              <Spin />
            </div>
          )}
        </div>
      </div>
      <div className='p-8'>
        <div className='pb-8 space-x-4'>
          <Tag text="相关人物" color="#DAA520" opacity={0.2} textColor='black' />
          {
            user && user.privilege > 0 && colophon && (
              // TODO:修改人物信息
              <IndividualEditForm colophon={colophon} setColophon={setColophon} messageApi={messageApi} />
            )
          }
        </div>
        <ProTable
          rowKey="title"
          dataSource={colophon?.related_individuals}
          search={false}
          options={false}
          columns={[
            {
              title: '人物姓名',
              dataIndex: 'name',
              render: (text, record) => (
                <Link className="text-[#c19d50]" href={`/individual/${record.id}`}>{record.name}</Link>
              ),
            },
            {
              title: '参与活动',
              dataIndex: 'type',
            },
            {
              title: '活动地点',
              dataIndex: 'place',
              ellipsis: true,
            },
            {
              title: '备注',
              dataIndex: 'note',
              ellipsis: true,
            }
          ]}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            defaultPageSize: 5,
          }}
        />
      </div>
    </div >
  );
}