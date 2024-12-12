import { getResetCode, resetPassword } from "@/lib/user";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { LoginForm, ProFormCaptcha, ProFormText } from "@ant-design/pro-components";
import { Button, Modal, Tabs } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";

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
      messageApi.error('密码修改失败');
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
                messageApi.success('验证码已发送至邮箱,15分钟内有效');
              }).catch((e) => {
                messageApi.error('验证码发送失败');
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
