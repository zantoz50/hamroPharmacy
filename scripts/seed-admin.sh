#!/usr/bin/env bash
set -e

# Load environment variables from env.example if present
if [ -f ./env.example ]; then
  set -o allexport
  source ./env.example
  set +o allexport
fi

node -e "require('./src/services/user.service').seedAdminFromEnv().then(()=>console.log('Admin seeded (if creds provided).')).catch(e=>{ console.error(e); process.exit(1); })"
