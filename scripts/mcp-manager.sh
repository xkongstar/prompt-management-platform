#!/bin/bash

# MCP Tools Manager for Prompt Management Platform
# This script helps manage and run MCP tools for the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install MCP tools
install_mcp_tools() {
    print_color "$YELLOW" "Installing MCP tools..."
    
    # Install SDK
    npm install -g @modelcontextprotocol/sdk
    
    # Install available servers
    npm install -g enhanced-postgres-mcp-server
    npm install -g @modelcontextprotocol/server-filesystem
    
    print_color "$GREEN" "MCP tools installed successfully!"
}

# Function to setup PostgreSQL MCP server
setup_postgres_mcp() {
    print_color "$YELLOW" "Setting up PostgreSQL MCP server..."
    
    # Check if PostgreSQL is running
    if docker ps | grep -q prompt-postgres; then
        print_color "$GREEN" "PostgreSQL container is running"
        
        # Start the MCP server
        npx enhanced-postgres-mcp-server &
        print_color "$GREEN" "PostgreSQL MCP server started"
    else
        print_color "$RED" "PostgreSQL container is not running. Please start Docker Compose first."
        exit 1
    fi
}

# Function to setup filesystem MCP server
setup_filesystem_mcp() {
    print_color "$YELLOW" "Setting up Filesystem MCP server..."
    
    npx @modelcontextprotocol/server-filesystem /workspace &
    print_color "$GREEN" "Filesystem MCP server started"
}

# Function to list available MCP tools
list_tools() {
    print_color "$YELLOW" "Available MCP tools:"
    echo ""
    echo "1. enhanced-postgres-mcp-server - PostgreSQL database operations"
    echo "2. @modelcontextprotocol/server-filesystem - File system operations"
    echo "3. @modelcontextprotocol/sdk - MCP SDK for development"
    echo ""
}

# Function to check tool status
check_status() {
    print_color "$YELLOW" "Checking MCP tools status..."
    echo ""
    
    if command_exists npx; then
        print_color "$GREEN" "✓ npx is installed"
    else
        print_color "$RED" "✗ npx is not installed"
    fi
    
    if npm list -g enhanced-postgres-mcp-server >/dev/null 2>&1; then
        print_color "$GREEN" "✓ PostgreSQL MCP server is installed"
    else
        print_color "$RED" "✗ PostgreSQL MCP server is not installed"
    fi
    
    if npm list -g @modelcontextprotocol/server-filesystem >/dev/null 2>&1; then
        print_color "$GREEN" "✓ Filesystem MCP server is installed"
    else
        print_color "$RED" "✗ Filesystem MCP server is not installed"
    fi
    
    echo ""
}

# Main menu
main() {
    echo "================================"
    print_color "$GREEN" "MCP Tools Manager"
    echo "================================"
    echo ""
    echo "Select an option:"
    echo "1. Install MCP tools"
    echo "2. Setup PostgreSQL MCP server"
    echo "3. Setup Filesystem MCP server"
    echo "4. List available tools"
    echo "5. Check tools status"
    echo "6. Exit"
    echo ""
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            install_mcp_tools
            ;;
        2)
            setup_postgres_mcp
            ;;
        3)
            setup_filesystem_mcp
            ;;
        4)
            list_tools
            ;;
        5)
            check_status
            ;;
        6)
            print_color "$GREEN" "Goodbye!"
            exit 0
            ;;
        *)
            print_color "$RED" "Invalid choice. Please try again."
            main
            ;;
    esac
}

# Run main function if script is executed directly
if [ "$#" -eq 0 ]; then
    main
else
    # Allow direct command execution
    case "$1" in
        install)
            install_mcp_tools
            ;;
        postgres)
            setup_postgres_mcp
            ;;
        filesystem)
            setup_filesystem_mcp
            ;;
        list)
            list_tools
            ;;
        status)
            check_status
            ;;
        *)
            print_color "$RED" "Unknown command: $1"
            echo "Usage: $0 [install|postgres|filesystem|list|status]"
            exit 1
            ;;
    esac
fi