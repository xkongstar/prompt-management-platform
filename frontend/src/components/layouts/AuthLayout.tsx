import type React from "react"
import { Outlet } from "react-router-dom"
import { Layout, Typography } from "antd"

const { Content, Footer } = Layout
const { Text } = Typography

const AuthLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer className="text-center bg-transparent border-t-0 mt-8">
          <Text className="text-gray-500">© 2024 Prompt Management Platform. All rights reserved.</Text>
        </Footer>
      </Content>
    </Layout>
  )
}

export default AuthLayout
