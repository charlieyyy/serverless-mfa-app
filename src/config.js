const config = {
  s3: {
    REGION: "YOUR_S3_UPLOADS_BUCKET_REGION",
    BUCKET: "YOUR_S3_UPLOADS_BUCKET_NAME",
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "YOUR_API_GATEWAY_URL",
  },
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_WFuEUEIHS",
    APP_CLIENT_ID: "49ct75padjr8dtktcprdc01j5q",
    IDENTITY_POOL_ID: "91831d72-6ab8-4667-83d9-f9c7929fb6e6",
  },
};

export default config;
