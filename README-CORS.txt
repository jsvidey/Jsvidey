Jsvidey upload CORS fix
=======================

Contents:
- js/upload.js: current upload JavaScript from the supplied ZIP
- backblaze-cors.json: S3-compatible CORS rule for the Jsvidey origin

IMPORTANT
This ZIP does not automatically change Backblaze settings. Browser JavaScript cannot repair a server-side CORS policy.

Apply the CORS rule to the S3 Compatible API for bucket showjsbot-storage.
The rule allows:
- Origin: https://jsvidey.pages.dev
- Methods: GET, HEAD, PUT
- Headers: *

WARNING: PutBucketCors replaces the bucket's existing S3 CORS rules. Merge this rule with any existing rules you need before applying it.

Example using AWS CLI configured with the Backblaze S3-compatible endpoint and credentials:
aws s3api put-bucket-cors --endpoint-url https://s3.us-east-005.backblazeb2.com --bucket showjsbot-storage --cors-configuration file://backblaze-cors.json

After applying, retry upload with a fresh signed URL (upload within 5 minutes).
Keep the bucket Private. Do not share B2_APPLICATION_KEY.
