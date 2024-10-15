# B2B-UI Monorepo

## Toolkit

1. Run the `./.setup.sh`; this should get you started, if it doesn't crash horribly.

### vpcs

This is the primary script runner. It runs a few different kinds of scripts:

- init - this initializes some platform feature, like pnpm or nx workspaces.
- install - this installs required software for support, and of the correct version (usually).
- sanity - used internally to ensure that things exist before calling them. Some scripts run on /bin/sh until bash support is guaranteed.
- sys - does some system work, like finding your package manager
- util - does a lot of utilities.

Most calls are done via namespace and script name:

`vpcs init nx-workspace`

But util scripts will be the default namespace, if a script exists, ergo:

`vpcs log error "Failure"`

## RBAC-UI

For this to work, you need have HB proxy installed and ARQ access to any service (for example mx-notification-service), that communicates with users service and access service. More information can be found on Confluence https://groupondev.atlassian.net/wiki/spaces/JTIER/pages/37735732357/Running+Locally

First you need to authenticate with cloud-elevator

`kubectl cloud-elevator auth`

Then with sudo you can start the proxy

`sudo hb-local-proxy --context gcp-stable-us-central1 --namespace mx-notification-service-staging`

### Local development

It will start local development server, you will need authToken to use it localy. And it verifies the token with the users service.

`nx dev rbac-ui`
