#!/bin/bash
# Package the API for Elastic Beanstalk upload (run from repo root on Git Bash / WSL / macOS)
set -e
cd "$(dirname "$0")/../../server"
npm ci
npm run build
zip -r ../deploy/aws/spacilly-api.zip . \
  -x "node_modules/*" \
  -x "uploads/*" \
  -x ".env" \
  -x "env"
echo "Created deploy/aws/spacilly-api.zip — upload in EB Console → Upload and deploy"
