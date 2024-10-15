# B2B-UI Monorepo

## RBAC-UI
For this to work, you need have HB proxy installed and ARQ access to any service on staging (for example rbac-ui-staging-sox), that communicates with users service and access service. More information can be found on Confluence https://groupondev.atlassian.net/wiki/spaces/JTIER/pages/37735732357/Running+Locally

Once installed run script:

`./localdev.sh`

This will start the proxy and the local development server

## Setup and development

1. `pnpm i`
2. `pnpm run dev`
