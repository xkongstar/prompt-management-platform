#!/bin/bash

# Database backup script

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/promptdb_backup_$TIMESTAMP.sql"

echo "🗄️ Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose exec -T postgres pg_dump -U promptuser -d promptdb > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Database backup created: ${BACKUP_FILE}.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "🧹 Cleaned up old backups"
