-- Initialize the database with proper indexes for better performance
-- This script will be automatically executed when setting up the database

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON Prompt(userId);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON Prompt(createdAt);
CREATE INDEX IF NOT EXISTS idx_prompts_title ON Prompt(title);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON Prompt(tags);

-- Create full-text search index for content (SQLite FTS5)
-- Note: This would require FTS5 extension, keeping it simple for MVP
-- CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(title, content, tags, content=Prompt);

-- Insert some sample data for testing (optional)
-- INSERT INTO User (id, name, email) VALUES ('sample-user-id', 'Test User', 'test@example.com');
-- INSERT INTO Prompt (id, title, content, tags, userId) VALUES 
--   ('sample-prompt-1', '代码审查提示词', '请帮我审查以下代码，重点关注性能、安全性和可维护性...', '编程, 代码审查, 开发', 'sample-user-id'),
--   ('sample-prompt-2', '文案创作助手', '请帮我创作一篇关于...的营销文案，要求...', '营销, 文案, 创作', 'sample-user-id');
