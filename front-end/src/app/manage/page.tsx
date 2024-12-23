'use client'
import { useUserStore } from '@/store/useStore'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { getPending, handleRequest, ModifiactionRequest } from '@/lib/manage';
import { Image, Form, message, Spin, Tabs, Tag, Button } from 'antd';
import { EditableProTable, ModalForm, ProColumns, ProForm, ProFormText, ProFormTextArea, ProList } from '@ant-design/pro-components';
import UserAvatar from '@/components/UserAvatar';
import { Colophon, getColophonById, putColophon, RelatedIndividual } from '@/lib/colophon';
import { MessageInstance } from 'antd/es/message/interface';
import { getPdf } from '@/lib/pdf';
import { getPrefaceAndPostscriptById, PrefaceAndPostscript, putPrefaceAndPostscript } from '@/lib/preface_and_postscript';
import { fetchUser } from '@/lib/user';
import Link from 'next/link';

const EditForm = ({ request_id, target_id, oldValue, newValue, type, messageApi, handleRefresh }) => {
  const [form] = Form.useForm();
  const [pdfPage, setPdfPage] = useState<string | null>(null);
  const fetchData = async () => {
    try {
      let res, page, pdfId;
      if (type === 'colophon') {
        res = await getColophonById(target_id);
        page = res.page_id;
        pdfId = res.pdf_id;
      } else if (type === 'preface_and_postscript') {
        res = await getPrefaceAndPostscriptById(target_id);
        page = res.page_id;
        pdfId = res.copy_id;
      }
      const res2 = await getPdf(type, pdfId, page);
      setPdfPage(`data:image/jpeg;base64,${res2.image}`);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const colophonFields = [
    { name: 'scripture_name', label: '牌记名' },
    { name: 'qianziwen', label: '千字文' },
    { name: 'content', label: '牌记内容', isTextArea: true },
    { name: 'time', label: '刊刻时间' },
    { name: 'place', label: '刊刻地点' },
    { name: 'words_num', label: '记字' },
    { name: 'money', label: '该银' },
    { name: 'pearwood', label: '梨板' },
    { name: 'wish', label: '祈愿' },
  ];

  const prefaceFields = [
    { name: 'title', label: '篇名' },
    { name: 'classic', label: '典籍' },
    { name: 'author', label: '作者' },
    { name: 'translator', label: '译者' },
    { name: 'category', label: '类别' },
    { name: 'dynasty', label: '朝代', isTextArea: false },
  ];

  const fields = type === 'colophon' ? colophonFields : prefaceFields;
  const groupedFields = type === 'colophon'
    ? ['scripture_name', 'qianziwen', 'time', 'place', 'words_num', 'money', 'pearwood', 'wish']
    : [];

  const handleSubmit = async (values) => {
    try {
      await handleRequest(request_id, type, values, "approved");
      messageApi.success('修改成功');
    } catch (err) {
      if (err.status === 403) {
        messageApi.error('权限不足');
      } else {
        messageApi.error('修改失败');
      }
    }
    handleRefresh();
  };

  const handleReject = async () => {
    try {
      await handleRequest(request_id, type, {}, "rejected");
      messageApi.success('拒绝成功');
    } catch (err) {
      if (err.status === 403) {
        messageApi.error('权限不足');
      } else {
        messageApi.error('拒绝失败');
      }
    }
    handleRefresh();
  }

  return (
    <ModalForm
      title={`检查${type === 'colophon' ? '牌记' : '序跋'}内容`}
      initialValues={newValue}
      trigger={<a>查看</a>}
      form={form}
      onOpenChange={(open) => {
        if (open) {
          fetchData();
        }
      }}
      width={1200}
      autoFocusFirstInput
      submitter={{
        render: (_, dom) => {
          return (
            <div className='space-x-2'>
              <Button danger onClick={handleReject}>
                拒绝
              </Button>
              <Button type="primary" onClick={() => { handleSubmit(form.getFieldsValue()); }}>
                提交
              </Button>
            </div >
          )
        }
      }}
    >
      <div className="w-full h-full flex flex-col sm:flex-col md:flex-row lg:flex-row">
        <div className="md:w-2/3">
          {fields.map((field) => {
            if (field.isTextArea) {
              return (
                <>
                  <ProFormTextArea
                    name={`old_${field.name}`}
                    label={`原${field.label}`}
                    initialValue={oldValue[field.name] || '-'}
                    readonly
                  />
                  <ProFormTextArea
                    name={field.name}
                    label={`新${field.label}`}
                    placeholder={`请输入${field.label}`}
                  />
                </>
              );
            }
            if (groupedFields.includes(field.name)) {
              return (
                <ProForm.Group key={field.name}>
                  <ProFormText
                    name={`old_${field.name}`}
                    label={`原${field.label}`}
                    initialValue={oldValue[field.name] || '-'}
                    width="md"
                    disabled
                  />
                  <ProFormText
                    width="md"
                    name={field.name}
                    label={`新${field.label}`}
                    placeholder={`请输入${field.label}`}
                  />
                </ProForm.Group>
              );
            }
            return (
              <ProForm.Group key={field.name}>
                <ProFormText
                  name={`old_${field.name}`}
                  label={`原${field.label}`}
                  initialValue={oldValue[field.name] || '-'}
                  width="md"
                  disabled
                />
                <ProFormText
                  width="md"
                  name={field.name}
                  label={`新${field.label}`}
                  placeholder={`请输入${field.label}`}
                />
              </ProForm.Group>
            );
          })}
        </div>
        <div className="md:w-1/3">
          {pdfPage ? (
            <Image src={pdfPage} alt={`Page ${target_id}`} style={{ maxWidth: '100%' }} />
          ) : (
            <div className="flex justify-center items-center" style={{ height: '100%', width: '100%' }}>
              <Spin />
            </div>
          )}
        </div>
      </div>
    </ModalForm >
  );
};


const IndividualEditForm = ({ request_id, target_id, oldValue, newValue, messageApi, handleRefresh }: { request_id: number, target_id: number, oldValue: RelatedIndividual[], newValue: RelatedIndividual[], messageApi: MessageInstance, handleRefresh: () => void }) => {
  const [form] = Form.useForm<RelatedIndividual[]>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => {
    return newValue ? newValue.map((item) => item.id) : []
  }
  );
  const [pdfPage, setPdfPage] = useState<string | null>(null);
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

  const handleSubmit = async (values) => {
    try {
      await handleRequest(request_id, "indcol", values, "approved");
      messageApi.success('修改成功');
    } catch (err) {
      if (err.status === 403) {
        messageApi.error('权限不足');
      } else {
        messageApi.error('修改失败');
      }
    }
    handleRefresh();
  };

  const handleReject = async () => {
    try {
      await handleRequest(request_id, "indcol", {}, "rejected");
      messageApi.success('拒绝成功');
    } catch (err) {
      if (err.status === 403) {
        messageApi.error('权限不足');
      } else {
        messageApi.error('拒绝失败');
      }
    }
    handleRefresh();
  }
  const fetchData = async () => {
    try {
      let res, page, pdfId;
      res = await getColophonById(target_id);
      page = res.page_id;
      pdfId = res.pdf_id;
      const res2 = await getPdf("colophon", pdfId, page);
      setPdfPage(`data:image/jpeg;base64,${res2.image}`);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <ModalForm<RelatedIndividual[]> title="修改牌记信息"
      initialValues={newValue}
      trigger={
        <a>查看</a>
      }
      form={form}
      width={1200}
      autoFocusFirstInput
      onOpenChange={(open) => {
        if (open) {
          fetchData();
        }
      }}
      submitter={{
        render: (_, dom) => {
          return (
            <div className='space-x-2'>
              <Button danger onClick={handleReject}>
                拒绝
              </Button>
              <Button type="primary" onClick={() => { handleSubmit(form.getFieldsValue()); }}>
                接受
              </Button>
            </div>
          )
        }
      }
      }
    >
      <div className="w-full h-full flex flex-col sm:flex-col md:flex-row lg:flex-row">
        <div className="md:w-2/3">
          <ProForm.Item
            label="原始人物列表"
            name="oldValue"
            initialValue={oldValue}
          >
            <EditableProTable<RelatedIndividual>
              rowKey="id"
              recordCreatorProps={false}
              toolBarRender={false}
              columns={columns}
            />
          </ProForm.Item>
          <ProForm.Item
            label="相关人物列表"
            name="individuals"
            initialValue={newValue}
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
        </div>
        <div className="md:w-1/3">
          {pdfPage ? (
            <Image src={pdfPage} alt={`Page ${target_id}`} style={{ maxWidth: '100%' }} />
          ) : (
            <div className="flex justify-center items-center" style={{ height: '100%', width: '100%' }}>
              <Spin />
            </div>
          )}
        </div>
      </div>
    </ModalForm >
  )
}


type tabsType = 'colophon' | 'indcol' | 'preface_and_postscript';

const ModifiactionRequestList: React.FC<{ type: tabsType, title: string }> = ({ type, title }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  return (<ProList<ModifiactionRequest>
    rowKey="request_id"
    headerTitle={title}
    key={refreshKey}
    pagination={{
      pageSizeOptions: ['5', '10', '20', '50'],
      defaultPageSize: 20,
    }}
    request={async (params = {}) => {
      const { current = 1, pageSize = 20, title = null, status = null } = params;
      const { data, total } = await getPending(current, pageSize, type, status, title)
      return {
        data: data,
        success: true,
        total: total
      }
    }}
    search={{
      showHiddenNum: true,
      defaultCollapsed: false,
      className: "bg-[#f3f1ea]",
    }}
    metas={{
      title: {
        title: type === 'colophon' || type === 'indcol' ? '牌记名称' : '序跋名称',
        dataIndex: 'name',
        render: (_, record) => {
          let path = type === 'colophon' || type === 'indcol' ? 'colophon' : 'preface_and_postscript'
          return <Link href={`/${path}/${record.target_id}`}>{record.name}</Link>
        },
      },
      avatar: {
        render: (_, record) => (
          <UserAvatar user={record.user} />
        ),
        search: false,
      },
      subTitle: {
        search: false,
        render: (_, record) => {
          return (
            <>
              {
                record.status === 'pending' ? (
                  <Tag color="yellow" >
                    待处理
                  </Tag>
                ) : record.status === 'approved' ? (
                  <Tag color="green" >
                    已接受
                  </Tag>
                ) : (
                  <Tag color="red" >
                    已拒绝
                  </Tag>
                )
              }
              <Tag color='geekblue'>{record.requested_at}</Tag>
              {record.handle_at && <Tag color='purple'>{record.handle_at}</Tag>}
            </>
          );
        }
      },
      description: {
        search: false,
        render: (_, record) => (
          <div>
            修改者:{record.user.username}
          </div>
        )
      },
      status: {
        title: '状态',
        valueType: 'select',
        valueEnum: {
          all: { text: '全部', status: 'Default' },
          pending: { text: '待处理', status: 'Processing' },
          approved: { text: '已通过', status: 'Success' },
          rejected: {
            text: '已拒绝', status: 'Error'
          },
        },
      },
      actions: {
        search: false,
        render: (_, record) => [
          type === 'colophon' ? (
            <EditForm
              request_id={record.request_id}
              target_id={record.target_id}
              oldValue={record.old_value as Colophon}
              newValue={record.new_value as Colophon}
              messageApi={message}
              type="colophon"
              handleRefresh={handleRefresh}
            />
          ) : type === 'indcol' ? (
            <IndividualEditForm
              request_id={record.request_id}
              target_id={record.target_id}
              oldValue={record.old_value.individuals as RelatedIndividual[]}
              newValue={record.new_value.individuals as RelatedIndividual[]}
              messageApi={message}
              handleRefresh={handleRefresh}
            />
          ) : (
            <EditForm
              target_id={record.target_id}
              request_id={record.request_id}
              oldValue={record.old_value as PrefaceAndPostscript}
              newValue={record.new_value as PrefaceAndPostscript}
              messageApi={message}
              type="preface_and_postscript"
              handleRefresh={handleRefresh}
            />
          ),
        ]
      }
    }}
  />
  )
}

export default function Page() {
  const { user } = useUserStore()
  const router = useRouter()
  const [type, setType] = useState<tabsType>('colophon')
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    // TODO:懒得配置路由守卫了
    if (!user) {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) router.push('/');
      fetchUser().then((res) => {
        if (res.privilege <= 1) {
          router.push('/')
        }
      })
    }
    else if (user.privilege <= 1) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div className='w-full h-full overflow-y-auto max-w-[1000px] mx-auto '>
      {contextHolder}
      <Tabs
        centered
        activeKey={type}
        onChange={(activeKey) => setType(activeKey as tabsType)}
      >
        <Tabs.TabPane key={'colophon'} tab={'牌记内容'} />
        <Tabs.TabPane key={'indcol'} tab={'牌记相关人物'} />
        <Tabs.TabPane key={'preface_and_postscript'} tab={'序跋内容'} />
      </Tabs>
      {
        type === 'colophon' && <ModifiactionRequestList type='colophon' title='牌记内容' />
      }
      {
        type === 'indcol' && <ModifiactionRequestList type='indcol' title='牌记人物内容' />
      }
      {
        type === 'preface_and_postscript' && <ModifiactionRequestList type='preface_and_postscript' title='序跋内容' />
      }
    </div>
  )
}