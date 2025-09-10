import type React from "react"
import { Form, Input, Button, Card, Typography, Space, Divider, message } from "antd"
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import type { RegisterData } from "@/types"
import { ROUTES } from "@/utils/constants"

const { Title, Text } = Typography

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const handleSubmit = async (values: RegisterData & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...registerData } = values
      await register(registerData)
      navigate(ROUTES.DASHBOARD)
    } catch (error: any) {
      message.error(error.response?.data?.message || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-gray-900">
            Create your account
          </Title>
          <Text className="text-gray-600">Join us today! Please fill in your details to get started.</Text>
        </div>

        <Card className="shadow-lg border-0">
          <Form form={form} name="register" onFinish={handleSubmit} layout="vertical" size="large" autoComplete="off">
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Please input your full name!" },
                { min: 2, message: "Name must be at least 2 characters!" },
                { max: 50, message: "Name must not exceed 50 characters!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 8, message: "Password must be at least 8 characters!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Password must contain at least one lowercase letter, one uppercase letter, and one number!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error("The two passwords do not match!"))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading} block className="h-12 text-base font-medium">
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text className="text-gray-500 text-sm">Already have an account?</Text>
          </Divider>

          <div className="text-center">
            <Space>
              <Text className="text-gray-600">Already have an account?</Text>
              <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
