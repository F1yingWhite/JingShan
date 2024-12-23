import React, { useState } from 'react';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Tabs, message } from 'antd';
import { login } from '@/lib/user';
import { useUserStore } from '@/store/useStore';
import { register } from '@/lib/user';
import { ResetPasswordModal } from './ResetPasswordModal';

export type tabsType = 'account' | 'register';
interface LoginModalProps {
  type: tabsType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setType: React.Dispatch<React.SetStateAction<tabsType>>;
}

export default function LoginModal({ type, setIsModalOpen, setType }: LoginModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const { user, setUser } = useUserStore();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    const { email, password, autoLogin } = values;
    if (autoLogin) {
      window.localStorage.setItem('autoLogin', 'true');
    } else {
      window.localStorage.removeItem('autoLogin');
    }
    login({ email, password }).then((res) => {
      window.localStorage.setItem('jwt', res.data.jwt)
      setUser(res.data.user)
      messageApi.open({
        type: 'success',
        content: '登录成功',
      });
      setIsModalOpen(false);
    }).catch((e) => {
      messageApi.open({
        type: 'error',
        content: '登录失败',
      });
    }).finally(() => {
      setLoading(false);
    })
  };

  const handleRegister = async (values) => {
    setLoading(true);
    register(values).then((res) => {
      messageApi.open({
        type: 'success',
        content: '注册成功,请前往邮箱进行验证',
      });
      setType('account');
    }).catch((e) => {
      if (e.detail === "User already exists")
        messageApi.open({
          type: 'error',
          content: '注册失败:用户已经存在',
        });
      else {
        messageApi.open({
          type: 'error',
          content: '注册失败',
        });
      }
    }).finally(() => {
      setLoading(false);
    })
  }

  return (
    <div >
      {contextHolder}
      <ResetPasswordModal
        passwordModalOpen={passwordModalOpen}
        messageApi={messageApi}
        setPasswordModalOpen={setPasswordModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <LoginForm
        logo="/logo.svg"
        title={<><span>求是</span><span className='text-[#DAA520]'>智藏</span></>}
        submitter={false}
        onFinish={type === 'account' ? handleLogin : handleRegister}
      >
        <Tabs
          centered
          activeKey={type}
          onChange={(activeKey) => setType(activeKey as tabsType)}
        >
          <Tabs.TabPane key={'account'} tab={'账号密码登录'} />
          <Tabs.TabPane key={'register'} tab={'注册'} />
        </Tabs>
        {type === 'account' && (
          <>
            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className={'prefixIcon'} />,
              }}
              placeholder={'邮箱:'}
              rules={[
                {
                  required: true,
                  message: '请输入邮箱!',
                },
                {
                  pattern: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
                  message: '邮箱格式错误！',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={'prefixIcon'} />,
              }}
              placeholder={'密码: '}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },

              ]}
            />
            <div
              style={{
                marginBlockEnd: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                自动登录
              </ProFormCheckbox>
              <a
                style={{
                  float: 'right',
                }}
                onClick={() => {
                  setPasswordModalOpen(true);
                  setIsModalOpen(false);
                }}
              >
                忘记密码
              </a>
            </div>
            <Button disabled={loading} type='primary' className='w-full' htmlType="submit">
              登录
            </Button>
          </>
        )}
        {type === 'register' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className={'prefixIcon'} />,
              }}
              name="email"
              placeholder={'请输入邮箱'}
              rules={[
                {
                  required: true,
                  message: '请输入邮箱！',
                },
                {
                  pattern: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
                  message: '邮箱格式错误！',
                },
              ]}
            />
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={'prefixIcon'} />,
              }}
              name="username"
              placeholder={'用户名'}
              rules={[
                {
                  required: true,
                  message: '请输入用户名！',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={'prefixIcon'} />,
              }}
              placeholder={'密码: '}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
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
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致！'));
                  },
                }),
              ]}
            />
            <Button type='primary' className='w-full' htmlType="submit" disabled={loading}>
              注册
            </Button>
          </>
        )}
      </LoginForm>
    </div >
  );
};