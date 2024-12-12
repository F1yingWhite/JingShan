import { changePassword, changerAvatar, changeUsername, fetchUser } from "@/lib/user";
import { useUserStore } from "@/store/useStore";
import { LockOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText, ProFormUploadButton } from "@ant-design/pro-components";
import { Button, Modal, Tabs } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";

export type utilsType = 'password' | 'avatar' | 'username';

interface UserModalProps {
  userModalOpen: boolean;
  setUserModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messageApi: MessageInstance
  utilsType: utilsType;
  setUtilsType: React.Dispatch<React.SetStateAction<utilsType>>;
}

export function UserPasswordModal({ userModalOpen, setUserModalOpen, messageApi, utilsType, setUtilsType }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore();
  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await changePassword(values);
      await fetchUser().then((res) => {
        setUser(res.data);
      });
      messageApi.success('修改成功');
      setUserModalOpen(false);
    } catch (err) {
      messageApi.error("修改失败");
    } finally {
      setLoading(false);
    }
  }

  const handleChangeAvatar = async (values) => {
    setLoading(true);
    try {
      await changerAvatar({ avatar: values.avatar[0].thumbUrl });
      await fetchUser().then((res) => {
        setUser(res);
      });
      messageApi.success('修改成功');
      setUserModalOpen(false);
    } catch (err) {
      messageApi.error("修改失败");
    } finally {
      setLoading(false);
    }
  }

  const handleChangeUsername = async (values) => {
    setLoading(true);
    try {
      await changeUsername({ username: values.username });
      await fetchUser().then((res) => {
        setUser(res);
      });
      messageApi.success('修改成功');
      setUserModalOpen(false);
    } catch (err) {
      messageApi.error("修改失败");
    } finally {
      setLoading(false);
    }
  }

  return <Modal open={userModalOpen}
    onOk={() => {
      setUserModalOpen(false)
    }}
    onCancel={() => {
      setUserModalOpen(false);
    }}
    destroyOnClose={true}
    footer={null}>
    <LoginForm
      logo="/logo.svg"
      title={<><span>求是</span><span className='text-[#DAA520]'>智藏</span></>}
      submitter={false}
      onFinish={(values) => {
        if (utilsType === 'password') {
          handleChangePassword(values);
        } else if (utilsType === 'avatar') {
          handleChangeAvatar(values);
        } else if (utilsType === 'username') {
          handleChangeUsername(values);
        }
      }}
    >
      <Tabs
        centered
        activeKey={utilsType}
        onChange={(activeKey) => setUtilsType(activeKey as utilsType)}
      >
        <Tabs.TabPane key={'password'} tab={'修改密码'} />
        <Tabs.TabPane key={'avatar'} tab={'头像'} />
        <Tabs.TabPane key={'username'} tab={'用户名'} />
      </Tabs>
      {utilsType === 'password' && (
        <>
          <ProFormText.Password
            name="old_password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'原始密码: '}
            rules={[
              {
                required: true,
                message: '请输入原始密码！',
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/,
                message: '密码必须包含数字、大小写，至少8位字符。',
              },
            ]}
          />
          <ProFormText.Password
            name="new_password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'修改密码: '}
            rules={[
              {
                required: true,
                message: '请输入修改的密码！',
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/,
                message: '密码必须包含数字、大小写，至少8位字符。',
              },
            ]}
          />
          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'确认密码: '}
            rules={[
              {
                required: true,
                message: '请再次输入密码！',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          />
          <Button type='primary' className='w-full' htmlType="submit" disabled={loading}>
            修改
          </Button>
        </>
      )}
      {utilsType === 'avatar' && (
        <div className='flex items-center flex-col'>
          <ProFormUploadButton
            name="avatar"
            max={1}
            fieldProps={{
              name: 'file',
              listType: 'picture-card',
            }}
          // action="/upload.do"
          />
          <Button type='primary' className='w-full' htmlType="submit" disabled={loading}>
            修改
          </Button>
        </div>
      )}
      {utilsType === 'username' && (
        <div className='flex items-center flex-col'>
          <ProFormText
            name="username"
            placeholder="请输入用户名"
          />
          <Button type='primary' className='w-full' htmlType="submit" disabled={loading}>
            修改
          </Button>
        </div>
      )}
    </LoginForm>
  </Modal>
}

