import React, { useState } from 'react';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Modal, Tabs, message } from 'antd';
import { getResetCode, login, resetPassword } from '@/lib/user';
import { useUserStore } from '@/store/useStore';
import { register } from '@/lib/user';
import { MessageInstance } from 'antd/es/message/interface';


export type utilsType = 'password' | 'register';

interface ResetPasswordModalProps {
  passwordModalOpen: boolean;
  setPasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messageApi: MessageInstance
}

export function ResetPasswordModal({ passwordModalOpen, setPasswordModalOpen, setIsModalOpen, messageApi }: ResetPasswordModalProps) {
  const [utilsType, setUtilsType] = useState<utilsType>('password');
  const [resetEmail, setResetEmail] = useState('');
  const handleResetPassword = async (values) => {
    resetPassword(values).then((res) => {
      messageApi.open({
        type: 'success',
        content: '密码修改成功',
      });
      setPasswordModalOpen(false);
      setIsModalOpen(true);
    }).catch((e) => {
      message.error('密码修改失败');
    });
  }

  return <Modal open={passwordModalOpen}
    onOk={() => {
      setPasswordModalOpen(false)
    }}
    onCancel={() => {
      setPasswordModalOpen(false);
      setIsModalOpen(true);
    }}
    footer={null}>
    <LoginForm
      logo="/logo.svg"
      title={<><span>求是</span><span className='text-[#DAA520]'>智藏</span></>}
      submitter={false}
      onFinish={handleResetPassword}
      onFieldsChange={(values) => {
        if (values[0].name[0] === 'email') {
          setResetEmail(values[0].value);
        }
      }}
    >
      <Tabs
        centered
        activeKey={utilsType}
        onChange={(activeKey) => setUtilsType(activeKey as utilsType)}
      >
        <Tabs.TabPane key={'password'} tab={'忘记密码'} />
      </Tabs>
      {utilsType === 'password' && (
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
            name="new_password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'重置密码: '}
            rules={[
              {
                required: true,
                message: '请输入重置密码！',
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
          <ProFormCaptcha
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            captchaProps={{
              size: 'large',
            }}
            placeholder={'请输入验证码'}
            captchaTextRender={(timing, count) => {
              if (timing) {
                return `${count} ${'获取验证码'}`;
              }
              return '获取验证码';
            }}
            name="code"
            rules={[
              {
                required: true,
                message: '请输入验证码！',
              },
            ]}
            onGetCaptcha={async () => {
              getResetCode(resetEmail).then((res) => {
                message.success('验证码已发送至邮箱,15分钟内有效');
              }).catch((e) => {
                message.error('验证码发送失败');
              });
            }}
          />
          <Button type='primary' className='w-full' htmlType="submit">
            修改
          </Button>
        </>
      )}
    </LoginForm>
  </Modal>
}


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

  const handleLogin = async (values) => {
    const { email, password, autoLogin } = values;
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
    });
  };

  const handleRegister = async (values) => {
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
    });
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
                {/* TODO:后续增加 */}
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
            <Button type='primary' className='w-full' htmlType="submit">
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
            <Button type='primary' className='w-full' htmlType="submit">
              注册
            </Button>
          </>
        )}
      </LoginForm>
    </div >
  );
};