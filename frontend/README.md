# Groupon Admin
We are using PNPM as package manager!

Start with installing dependencies:

`pnpm i`

## Running the app
This service connects to other backend services, so for this to work, you need have HB proxy installed and ARQ access to any service (for example mx-notification-service), that communicates with users service. More information can be found on [Confluence](https://groupondev.atlassian.net/wiki/spaces/JTIER/pages/37735732357/Running+Locally) and you will also need [Cloud elevator](https://groupondev.atlassian.net/wiki/spaces/IS/pages/80352510009/Installing+Cloud-elevator+and+Port+Forwarding).

First you need to authenticate with cloud-elevator

`kubectl cloud-elevator auth` or `kubectl cloud-elevator auth browser` to authenticate in a browser.

Then with sudo you can start the proxy

`sudo hb-local-proxy --context gcp-stable-us-central1 --namespace mx-notification-service-staging`

Or you can just run shell script:

`./localdev.sh`

If you get `error: current-context is not set`, you need to remove your kube config `mv ~/.kube/config ~/.kube/config.old` and generate new one using `kubectl cloud-elevator auth`

## Local development

It will start local development server

`pnpm run dev`

We are using Ant.Design library for UI components. You can find more information on [Ant.Design](https://ant.design/components/overview/). Do not create custom styles, always try to use Ant.Design components for page layout. For styling we are using TailwindCSS, you can find more information on [TailwindCSS](https://tailwindcss.com/docs).

### Linting
We are using ESLint for linting

`pnpm run lint`

### Formatting
We are using Prettier for formatting

`pnpm run format`

## Running tests
Unit tests

`pnpm run test`

E2E tests

`pnpm run e2e`

## Building the app
It is always good to check if the app is building correctly before committing

`pnpm run build`

### Running the app
`pnpm run start`
