# Place your local stuff in Makefile.local
-include .env
-include vendors/deps-pipelines/shared/Makefile
-include Makefile.local
commit_short_sha := "$(CI_COMMIT_SHORT_SHA)"
helm_upgrade_timeout := $(or $(HELM_UPGRADE_TIMEOUT), 300s)
NO_DEV_DOCKER_IMAGE = nginx

.PHONY: install
install:
	cp .env.example .env

.PHONY: login
login:
	docker login $(repository)

.PHONY: build-prereq
build-prereq:
	test -f .env || echo >> .env

.PHONY: prereq
prereq:
	docker network create deps-network || true

.PHONY: build
build: | build-prereq
	docker compose build	

.PHONY: logs
logs:
	docker compose logs -f

.PHONY: run
run: | prereq
	docker compose up -d

.PHONY: build-prod
build-prod: | build-prereq
	$(call build_service,nginx,./etc/Dockerfile)

.PHONY: push
push:
	$(call push_service,nginx)

.PHONY: deliver
deliver: | build-prod push

.PHONY: tag
tag:
	$(call tag_service,nginx)

.PHONY: pull
pull:
	$(call pull_service,nginx)

.PHONY: helm-upgrade-service
helm-upgrade-service:
	helm upgrade --install $(CI_PROJECT_NAME) .helm/services \
        --values .helm/services/values.yaml $(ADDITIONAL_VALUES) \
        --set registry=$(REPOSITORY_URL) \
        --set image.tag=$(commit_short_sha) \
        --set vault_settings.enabled=$(VAULT_ENABLE) \
        --timeout $(helm_upgrade_timeout) \
        --atomic \
        --wait \
        --debug \
        --namespace $(NAMESPACE)

.PHONY: helm-deployment-rollback
helm-deployment-rollback:
	helm rollback --namespace $(NAMESPACE) $(CI_PROJECT_NAME) 0

.PHONY: helm-rollback
helm-rollback:
	make helm-deployment-rollback

.PHONY: helm-upgrade
helm-upgrade:
	make helm-upgrade-service

testdkube := $(shell kubectl config current-context)
ifeq ($(testdkube), rancher-desktop)
.PHONY: skaffold
skaffold:
	cd skaffold && skaffold run -f skaffold.yaml
endif
