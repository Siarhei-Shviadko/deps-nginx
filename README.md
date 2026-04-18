# deps-nginx

Building service:
```bash
# Setup environment variables for run.
make install

# Fill required variables in .env file. 
# Actual information about variables could be found at KB onboarding page.

# Build service
make build
```
### Run locally using skaffold 
 Make sure that deps-infra (postgres, redis, rabbitmq is up) is up and running.

# !Note make sure that context is rancher-desktop
```bash 
kubectl config current-context 
```

Do the following commands:

```bash
make skaffold
```

## Enabling/Disabling vault usage
You can enable or disable vault secret usage without modifying kubernetes yaml files. By default vault usage is set to false inside value.yaml file but we override this value with VAULT_ENABLE_DEV, VAULT_ENABLE_QA, VAULT_ENABLE_INS, VAULT_ENABLE_DEMO, VAULT_ENABLE_DS variables from Settings >> CI/CD for each environment. If you change variable value from Settings >> CI/CD you need to manually start new pipline from CI/CD >> Pipelines.
