#!/bin/bash

# Build the portal
npm run build

# Deploy to development
if [ "$1" = "dev" ]; then
  echo "Deploying to development environment..."
  aws s3 sync dist/ s3://dev-developers.creditboost.co.ke --delete
  
# Deploy to production
elif [ "$1" = "prod" ]; then
  echo "Deploying to production environment..."
  aws s3 sync dist/ s3://developers.creditboost.co.ke --delete
else
  echo "Please specify an environment: dev or prod"
  exit 1
fi

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo "Deployment completed!"

