import { PrismaClient, UserRole, ProjectVisibility, PromptStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@promptmanagement.com" },
    update: {},
    create: {
      email: "admin@promptmanagement.com",
      passwordHash: adminPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  })

  console.log("✅ Created admin user:", admin.email)

  // Create demo users
  const demoUsers = [
    {
      email: "john.doe@example.com",
      name: "John Doe",
      password: "password123",
    },
    {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      password: "password123",
    },
    {
      email: "mike.johnson@example.com",
      name: "Mike Johnson",
      password: "password123",
    },
  ]

  const users = []
  for (const userData of demoUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash: hashedPassword,
        name: userData.name,
        role: UserRole.USER,
        emailVerified: true,
      },
    })
    users.push(user)
  }

  console.log("✅ Created demo users:", users.map((u) => u.email).join(", "))

  // Create demo projects
  const projects = []

  // John's personal project
  const personalProject = await prisma.project.create({
    data: {
      name: "Personal AI Prompts",
      description: "My collection of personal AI prompts for various tasks",
      ownerId: users[0].id,
      visibility: ProjectVisibility.PRIVATE,
    },
  })
  projects.push(personalProject)

  // Jane's marketing project
  const marketingProject = await prisma.project.create({
    data: {
      name: "Marketing Campaign Prompts",
      description: "AI prompts for marketing campaigns and content creation",
      ownerId: users[1].id,
      visibility: ProjectVisibility.TEAM,
    },
  })
  projects.push(marketingProject)

  // Mike's development project
  const devProject = await prisma.project.create({
    data: {
      name: "Development Assistant Prompts",
      description: "Code generation and debugging prompts for software development",
      ownerId: users[2].id,
      visibility: ProjectVisibility.PUBLIC,
    },
  })
  projects.push(devProject)

  console.log("✅ Created demo projects:", projects.map((p) => p.name).join(", "))

  // Add collaborators
  await prisma.projectCollaborator.create({
    data: {
      projectId: marketingProject.id,
      userId: users[0].id, // John as editor in Jane's project
      role: "EDITOR",
      invitedBy: users[1].id,
    },
  })

  await prisma.projectCollaborator.create({
    data: {
      projectId: devProject.id,
      userId: users[1].id, // Jane as viewer in Mike's project
      role: "VIEWER",
      invitedBy: users[2].id,
    },
  })

  console.log("✅ Added project collaborators")

  // Create tags for each project
  const personalTags = await Promise.all([
    prisma.tag.create({
      data: { name: "productivity", color: "#52c41a", projectId: personalProject.id },
    }),
    prisma.tag.create({
      data: { name: "creative", color: "#722ed1", projectId: personalProject.id },
    }),
    prisma.tag.create({
      data: { name: "learning", color: "#1890ff", projectId: personalProject.id },
    }),
  ])

  const marketingTags = await Promise.all([
    prisma.tag.create({
      data: { name: "copywriting", color: "#fa541c", projectId: marketingProject.id },
    }),
    prisma.tag.create({
      data: { name: "social-media", color: "#13c2c2", projectId: marketingProject.id },
    }),
    prisma.tag.create({
      data: { name: "email", color: "#eb2f96", projectId: marketingProject.id },
    }),
  ])

  const devTags = await Promise.all([
    prisma.tag.create({
      data: { name: "javascript", color: "#faad14", projectId: devProject.id },
    }),
    prisma.tag.create({
      data: { name: "python", color: "#52c41a", projectId: devProject.id },
    }),
    prisma.tag.create({
      data: { name: "debugging", color: "#f5222d", projectId: devProject.id },
    }),
  ])

  console.log("✅ Created tags for all projects")

  // Create demo prompts
  const prompts = []

  // Personal project prompts
  const personalPrompts = [
    {
      title: "Daily Task Prioritization",
      content: `Help me prioritize my daily tasks based on urgency and importance. Here are my tasks for today:

[List your tasks here]

Please organize them using the Eisenhower Matrix and suggest a schedule.`,
      tags: [personalTags[0], personalTags[2]], // productivity, learning
    },
    {
      title: "Creative Writing Inspiration",
      content: `Generate creative writing prompts for a short story. The story should be:
- Genre: [specify genre]
- Setting: [describe setting]
- Main character: [character description]
- Conflict: [type of conflict]

Provide 3 different story concepts with unique twists.`,
      tags: [personalTags[1]], // creative
    },
    {
      title: "Learning Plan Generator",
      content: `Create a structured learning plan for mastering [skill/topic]. Include:
- Learning objectives
- Recommended resources
- Practice exercises
- Milestones and timeline
- Assessment methods

Make it suitable for a beginner with [time commitment] hours per week.`,
      tags: [personalTags[2]], // learning
    },
  ]

  for (const promptData of personalPrompts) {
    const prompt = await prisma.prompt.create({
      data: {
        title: promptData.title,
        content: promptData.content,
        projectId: personalProject.id,
        authorId: users[0].id,
        status: PromptStatus.PUBLISHED,
      },
    })

    // Create initial version
    await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        title: prompt.title,
        content: prompt.content,
        authorId: users[0].id,
        changeLog: "Initial version",
      },
    })

    // Add tags
    for (const tag of promptData.tags) {
      await prisma.promptTag.create({
        data: {
          promptId: prompt.id,
          tagId: tag.id,
        },
      })
    }

    prompts.push(prompt)
  }

  // Marketing project prompts
  const marketingPrompts = [
    {
      title: "Product Launch Email Sequence",
      content: `Create a 5-email sequence for launching [product name]. Include:

Email 1: Teaser announcement
Email 2: Feature highlights
Email 3: Social proof and testimonials
Email 4: Limited-time offer
Email 5: Final call to action

Target audience: [describe audience]
Product benefits: [list key benefits]
Brand tone: [describe tone]`,
      tags: [marketingTags[0], marketingTags[2]], // copywriting, email
    },
    {
      title: "Social Media Content Calendar",
      content: `Generate a month-long social media content calendar for [brand/business]. Include:

- 4 posts per week (16 total)
- Mix of content types: educational, promotional, behind-the-scenes, user-generated
- Platform-specific adaptations for Instagram, Twitter, LinkedIn
- Relevant hashtags and optimal posting times
- Engagement strategies

Industry: [specify industry]
Target audience: [describe audience]
Brand voice: [describe voice]`,
      tags: [marketingTags[1]], // social-media
    },
  ]

  for (const promptData of marketingPrompts) {
    const prompt = await prisma.prompt.create({
      data: {
        title: promptData.title,
        content: promptData.content,
        projectId: marketingProject.id,
        authorId: users[1].id,
        status: PromptStatus.PUBLISHED,
      },
    })

    // Create initial version
    await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        title: prompt.title,
        content: prompt.content,
        authorId: users[1].id,
        changeLog: "Initial version",
      },
    })

    // Add tags
    for (const tag of promptData.tags) {
      await prisma.promptTag.create({
        data: {
          promptId: prompt.id,
          tagId: tag.id,
        },
      })
    }

    prompts.push(prompt)
  }

  // Development project prompts
  const devPrompts = [
    {
      title: "Code Review Checklist Generator",
      content: `Generate a comprehensive code review checklist for [programming language] projects. Include:

**Code Quality:**
- Readability and naming conventions
- Code structure and organization
- Performance considerations
- Error handling

**Security:**
- Input validation
- Authentication/authorization
- Data sanitization
- Vulnerability checks

**Testing:**
- Unit test coverage
- Integration tests
- Edge cases

**Documentation:**
- Code comments
- API documentation
- README updates

Customize for: [project type/framework]`,
      tags: [devTags[0]], // javascript (can be adapted)
    },
    {
      title: "Bug Investigation Assistant",
      content: `Help me debug this issue systematically:

**Problem Description:**
[Describe the bug/issue]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Language/Framework: [specify]
- Version: [specify]
- OS: [specify]

**Code Snippet:**
[Paste relevant code]

**Error Messages:**
[Include any error messages]

Please provide:
1. Potential root causes
2. Step-by-step debugging approach
3. Suggested fixes
4. Prevention strategies`,
      tags: [devTags[2]], // debugging
    },
  ]

  for (const promptData of devPrompts) {
    const prompt = await prisma.prompt.create({
      data: {
        title: promptData.title,
        content: promptData.content,
        projectId: devProject.id,
        authorId: users[2].id,
        status: PromptStatus.PUBLISHED,
      },
    })

    // Create initial version
    await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        title: prompt.title,
        content: prompt.content,
        authorId: users[2].id,
        changeLog: "Initial version",
      },
    })

    // Add tags
    for (const tag of promptData.tags) {
      await prisma.promptTag.create({
        data: {
          promptId: prompt.id,
          tagId: tag.id,
        },
      })
    }

    prompts.push(prompt)
  }

  console.log("✅ Created demo prompts:", prompts.length)

  // Add some favorites
  await prisma.userFavorite.create({
    data: {
      userId: users[0].id,
      promptId: prompts[3].id, // John favorites a marketing prompt
    },
  })

  await prisma.userFavorite.create({
    data: {
      userId: users[1].id,
      promptId: prompts[5].id, // Jane favorites a dev prompt
    },
  })

  console.log("✅ Added user favorites")

  // Create some draft prompts
  const draftPrompt = await prisma.prompt.create({
    data: {
      title: "Work in Progress: Advanced SEO Strategy",
      content: "This prompt is still being developed...",
      projectId: marketingProject.id,
      authorId: users[1].id,
      status: PromptStatus.DRAFT,
    },
  })

  await prisma.promptVersion.create({
    data: {
      promptId: draftPrompt.id,
      version: 1,
      title: draftPrompt.title,
      content: draftPrompt.content,
      authorId: users[1].id,
      changeLog: "Initial draft",
    },
  })

  console.log("✅ Created draft prompts")

  console.log("🎉 Database seeding completed successfully!")
  console.log("\n📊 Summary:")
  console.log(`- Users: ${users.length + 1} (including admin)`)
  console.log(`- Projects: ${projects.length}`)
  console.log(`- Prompts: ${prompts.length + 1}`)
  console.log(`- Tags: ${personalTags.length + marketingTags.length + devTags.length}`)
  console.log("\n🔐 Login credentials:")
  console.log("Admin: admin@promptmanagement.com / admin123456")
  console.log("Demo users: [email] / password123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
