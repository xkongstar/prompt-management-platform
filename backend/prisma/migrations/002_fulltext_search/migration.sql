-- Add full-text search capabilities for PostgreSQL

-- Create GIN indexes for full-text search on prompts
CREATE INDEX "prompts_title_fulltext_idx" ON "prompts" USING GIN (to_tsvector('english', "title"));
CREATE INDEX "prompts_content_fulltext_idx" ON "prompts" USING GIN (to_tsvector('english', "content"));

-- Create combined full-text search index
CREATE INDEX "prompts_combined_fulltext_idx" ON "prompts" USING GIN (
  to_tsvector('english', "title" || ' ' || "content")
);

-- Create full-text search index for project names and descriptions
CREATE INDEX "projects_name_fulltext_idx" ON "projects" USING GIN (to_tsvector('english', "name"));
CREATE INDEX "projects_description_fulltext_idx" ON "projects" USING GIN (to_tsvector('english', COALESCE("description", '')));

-- Create trigram indexes for fuzzy search (requires pg_trgm extension)
-- Note: This requires the pg_trgm extension to be enabled
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CREATE INDEX "prompts_title_trgm_idx" ON "prompts" USING GIN ("title" gin_trgm_ops);
-- CREATE INDEX "prompts_content_trgm_idx" ON "prompts" USING GIN ("content" gin_trgm_ops);
-- CREATE INDEX "projects_name_trgm_idx" ON "projects" USING GIN ("name" gin_trgm_ops);
-- CREATE INDEX "tags_name_trgm_idx" ON "tags" USING GIN ("name" gin_trgm_ops);
