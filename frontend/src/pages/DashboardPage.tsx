"use client"

import type React from "react"
import { Card, Row, Col, Statistic, Typography, Button, Space } from "antd"
import { ProjectOutlined, FileTextOutlined, HeartOutlined, PlusOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@/utils/constants"

const { Title, Paragraph } = Typography

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="m-0">
            Dashboard
          </Title>
          <Paragraph className="text-gray-600 m-0">
            Welcome back! Here's an overview of your prompt management activity.
          </Paragraph>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.PROJECTS)}>
            New Project
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Prompts"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Favorites" value={0} prefix={<HeartOutlined />} valueStyle={{ color: "#eb2f96" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="This Month" value={0} suffix="prompts" valueStyle={{ color: "#722ed1" }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Activity" className="h-96">
            <div className="flex items-center justify-center h-full text-gray-500">No recent activity</div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="h-96">
            <Space direction="vertical" className="w-full">
              <Button block onClick={() => navigate(ROUTES.PROJECTS)}>
                Create New Project
              </Button>
              <Button block onClick={() => navigate(ROUTES.PROMPTS)}>
                Browse Prompts
              </Button>
              <Button block onClick={() => navigate(ROUTES.SEARCH)}>
                Search Library
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
