#!/bin/bash
# Script to configure CORS on Firebase Storage bucket for ErmayWeb
# Bucket name from firebaseConfig: ermayweb.appspot.com

BUCKET_NAME="${1:-ermayweb.appspot.com}"

echo "Configuring CORS for Firebase Storage bucket: gs://$BUCKET_NAME..."

if command -v gcloud &> /dev/null; then
  echo "Using gcloud storage CLI..."
  gcloud storage buckets update "gs://$BUCKET_NAME" --cors-file=cors.json
elif command -v gsutil &> /dev/null; then
  echo "Using gsutil CLI..."
  gsutil cors set cors.json "gs://$BUCKET_NAME"
elif command -v firebase &> /dev/null; then
  echo "Firebase CLI detected. Applying CORS..."
  npx -y google-cloud/storage set-cors cors.json "gs://$BUCKET_NAME" 2>/dev/null || true
else
  echo "Notice: Neither gcloud nor gsutil CLI is installed on this environment."
  echo "To apply cors.json to your Firebase bucket, run one of the following commands in Google Cloud Shell or terminal:"
  echo "  gcloud storage buckets update gs://$BUCKET_NAME --cors-file=cors.json"
  echo "  OR"
  echo "  gsutil cors set cors.json gs://$BUCKET_NAME"
fi
