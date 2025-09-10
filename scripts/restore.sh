#!/bin/bash

# Database restore script

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -la ./backups/
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring database from: $BACKUP_FILE"

# Extract if compressed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Extracting compressed backup..."
    gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U promptuser -d promptdb
else
    cat $BACKUP_FILE | docker-compose exec -T postgres psql -U promptuser -d promptdb
fi

echo "✅ Database restore completed"
