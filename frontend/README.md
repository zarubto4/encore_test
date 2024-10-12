# <font color="#e8a913">Frontend</font>

## <font color="#e8a913">Project Documentation Overview</font>

We are using Ant.Design library for UI components.
You can find more information on [Ant.Design](https://ant.design/components/overview/).
Do not create custom styles, always try to use Ant. Design components for page layout.
For styling we are using TailwindCSS, you can find more information on [TailwindCSS](https://tailwindcss.com/docs).
(<font color="#ff0000">TODO Documentation</font>)

---
## <font color="#e8a913">Developing locally - Preparation Phase  (5 minutes step)</font>

1) Everything from [Parent Readme](../README.md)
2) We are using PNPM as package manager! Start with installing dependencies. But Before it, you need [installed](https://pnpm.io/installation) pnpm like via HomeBrew `brew install pnpm`
    - `pnpm i`

## <font color="#e8a913">Running the app - Connected to Legacy* Groupon Backend Services</font>
This service connects to other backend services, so for this to work,
you need:
1) Do everything from Developing locally -[Preparation Phase](../README.md)
    1) That communicates with users service. More information can be found on [Confluence](https://groupondev.atlassian.net/wiki/spaces/JTIER/pages/37735732357/Running+Locally)
       and you will also need [Cloud elevator](https://groupondev.atlassian.net/wiki/spaces/IS/pages/80352510009/Installing+Cloud-elevator+and+Port+Forwarding).

Run shell script:
```bash
kubectl cloud-elevator auth browser
sudo hb-local-proxy --context gcp-stable-us-central1 --namespace groupon-admin-staging
```

If you get `error: current-context is not set`, you need to remove your kube config `mv ~/.kube/config ~/.kube/config.old` and generate new one using `kubectl cloud-elevator auth`


## <font color="#e8a913">Local development + Connection to Server Less</font>

It will start local development server
```bash
pnpm run dev
```

## <font color="#e8a913">Testing</font>
Unit tests && E2E tests
```bash
pnpm run test && pnpm run e2e
```

## <font color="#e8a913">Building the app</font>
It is always good to check if the app is building correctly before committing
```bash
pnpm run build
```

**Running the app**
```bash
pnpm run start
```

## <font color="#e8a913">Others</font>

**Linting - Decoration**
```bash
pnpm run lint
```

**Formatting**
```bash
pnpm run format
```
