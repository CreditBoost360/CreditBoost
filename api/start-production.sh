#!/bin/bash
export NODE_ENV=production
npm install -g pm2
cd /home/sam/CreditBoost/api
npm install --production
pm2 start ecosystem.config.js
