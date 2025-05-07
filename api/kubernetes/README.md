# Kubernetes Deployment for Sunny Payment Gateway

This directory contains Kubernetes configuration files for deploying the Sunny Payment Gateway in a high-availability, scalable environment.

## Components

- **deployment.yaml**: Defines the deployment configuration for the API service
- **service.yaml**: Exposes the API service within the cluster
- **ingress.yaml**: Configures external access to the API service
- **configmap.yaml**: Stores configuration data
- **pvc.yaml**: Defines persistent storage for the database
- **hpa.yaml**: Configures horizontal pod autoscaling

## Deployment Instructions

1. Create the namespace:
   ```
   kubectl create namespace creditboost
   ```

2. Apply the ConfigMap:
   ```
   kubectl apply -f configmap.yaml -n creditboost
   ```

3. Create the persistent volume claim:
   ```
   kubectl apply -f pvc.yaml -n creditboost
   ```

4. Deploy the API service:
   ```
   kubectl apply -f deployment.yaml -n creditboost
   ```

5. Create the service:
   ```
   kubectl apply -f service.yaml -n creditboost
   ```

6. Apply the horizontal pod autoscaler:
   ```
   kubectl apply -f hpa.yaml -n creditboost
   ```

7. Configure the ingress:
   ```
   kubectl apply -f ingress.yaml -n creditboost
   ```

## Security Considerations

- The deployment uses non-root users
- All containers have limited capabilities
- Resource limits are enforced
- Network policies should be applied to restrict traffic
- Secrets should be managed using Kubernetes Secrets or an external vault

## Monitoring

- Liveness and readiness probes are configured
- Metrics are exposed at the `/metrics` endpoint
- Health checks are available at `/health/liveness` and `/health/readiness`

## Scaling

- The HorizontalPodAutoscaler will automatically scale the deployment based on CPU and memory usage
- Minimum replicas: 3
- Maximum replicas: 10
- Scale up when CPU usage exceeds 70% or memory usage exceeds 80%