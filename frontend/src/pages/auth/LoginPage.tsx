import type React from "react"
import { Form, Input, Button, Card, Typography, Space, Divider, message } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import type { LoginCredentials } from "@/types"
import { ROUTES } from "@/utils/constants"

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      await login(values)
      navigate(ROUTES.DASHBOARD)
    } catch (error: any) {
      message.error(error.response?.data?.message || "Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-gray-900">
            Sign in to your account
          </Title>
          <Text className="text-gray-600">Welcome back! Please enter your details.</Text>
        </div>

        <Card className="shadow-lg border-0">
          <Form form={form} name="login" onFinish={handleSubmit} layout="vertical" size="large" autoComplete="off">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading} block className="h-12 text-base font-medium">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text className="text-gray-500 text-sm">New to our platform?</Text>
          </Divider>

          <div className="text-center">
            <Space>
              <Text className="text-gray-600">Don't have an account?</Text>
              <Link to={ROUTES.REGISTER} className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
