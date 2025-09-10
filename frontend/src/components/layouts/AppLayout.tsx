"use client"

import type React from "react"
import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space, Input, Badge } from "antd"
import {
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  SearchOutlined,
  HeartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons"
import { useAuthStore } from "@/stores/authStore"
import { ROUTES } from "@/utils/constants"

const { Header, Sider, Content } = Layout
const { Title } = Typography
const { Search } = Input

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const menuItems = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: ROUTES.PROJECTS,
      icon: <ProjectOutlined />,
      label: "Projects",
    },
    {
      key: ROUTES.PROMPTS,
      icon: <FileTextOutlined />,
      label: "Prompts",
    },
    {
      key: ROUTES.SEARCH,
      icon: <SearchOutlined />,
      label: "Search",
    },
    {
      key: ROUTES.FAVORITES,
      icon: <HeartOutlined />,
      label: "Favorites",
    },
    {
      key: ROUTES.SETTINGS,
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ]

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate(ROUTES.SETTINGS),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(value)}`)
    }
  }

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} className="bg-white shadow-md" width={240}>
        <div className="p-4 border-b border-gray-200">
          <Title level={4} className="m-0 text-center">
            {collapsed ? "PMP" : "Prompt Manager"}
          </Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0 h-full"
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />

            <Search
              placeholder="Search prompts, projects..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              className="hidden md:block"
            />
          </div>

          <Space size="middle">
            <Badge count={0} showZero={false}>
              <Button type="text" icon={<BellOutlined />} className="text-lg" />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} size="small" />
                <span className="hidden md:inline text-gray-700">{user?.name}</span>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
