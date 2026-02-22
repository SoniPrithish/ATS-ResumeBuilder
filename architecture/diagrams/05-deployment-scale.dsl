@direction TB
@spacing 50

(Users) -> [CloudFront CDN + WAF]
[CloudFront CDN + WAF] -> [ALB Application Load Balancer]
[ALB Application Load Balancer] -> [ECS Fargate - Next.js App]
[ECS Fargate - Next.js App] -> [ECS Fargate - API Service]
[ECS Fargate - API Service] -> [[RDS PostgreSQL Multi-AZ]]
[ECS Fargate - API Service] -> [[ElastiCache Redis]]
[ECS Fargate - API Service] -> [[S3 Resume Storage]]
[ECS Fargate - API Service] -> [SQS Job Queue]
[SQS Job Queue] -> [ECS Fargate - Workers]
[ECS Fargate - Workers] -> [[RDS PostgreSQL Multi-AZ]]
[ECS Fargate - Workers] -> [[S3 Resume Storage]]
[ECS Fargate - API Service] -> [Lambda AI Orchestrator]
[Lambda AI Orchestrator] -> [OpenAI or Anthropic API]
[ECS Fargate - API Service] -> [CloudWatch + X-Ray]
