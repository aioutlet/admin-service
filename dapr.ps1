#!/usr/bin/env pwsh
# Run Admin Service with Dapr sidecar
# Usage: .\dapr.ps1

Write-Host "Starting Admin Service with Dapr..." -ForegroundColor Green
Write-Host "Service will be available at: http://localhost:1003" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:1003/health" -ForegroundColor Cyan
Write-Host "Dapr HTTP endpoint: http://localhost:3503" -ForegroundColor Cyan
Write-Host "Dapr gRPC endpoint: localhost:50003" -ForegroundColor Cyan
Write-Host ""

dapr run `
  --app-id admin-service `
  --app-port 1003 `
  --dapr-http-port 3503 `
  --dapr-grpc-port 50003 `
  --resources-path .dapr/components `
  --config .dapr/config.yaml `
  --log-level warn `
  -- node src/server.js
