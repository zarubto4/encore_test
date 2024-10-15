#!/usr/bin/env bash
# if this script exists, it will execute in the docker env after it is installed.
# This is a good place to put any post-installation commands that need to be run.
source .envrc
pnpm run build-rbac
vpcs serve rbac-ui
exit 0
