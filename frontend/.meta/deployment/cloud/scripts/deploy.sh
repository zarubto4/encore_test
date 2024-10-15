#!/bin/bash
set -eo pipefail

    (\
    helm3 template cmf-generic-api \
    --repo http://artifactory.groupondev.com/artifactory/helm-generic/ \
    --version '3.76.3' \
    -f .meta/deployment/cloud/components/app/common.yml \
    -f .meta/deployment/cloud/secrets/cloud/"$1".yml \
    -f .meta/deployment/cloud/components/app/"$1".yml \
    --set appVersion="${DEPLOYBOT_PARSED_VERSION}" \
    --set changeCause="${DEPLOYBOT_LOGBOOK_TICKET}" \
    ) \
    | krane deploy rbac-ui-"$2"-sox "${DEPLOYBOT_KUBE_CONTEXT}" --global-timeout=300s --filenames=- --no-prune
