#!/usr/bin/env bash
# Run Admin Service directly (without Dapr)
# Usage: ./run.sh

echo -e "\033[0;32mStarting Admin Service (Direct mode - no Dapr)...\033[0m"
echo -e "\033[0;36mService will be available at: http://localhost:1003\033[0m"
echo -e "\033[0;36mHealth check: http://localhost:1003/health\033[0m"
echo ""

npm run dev
