# <font color="#00a828">Backend</font>

## <font color="#00a828">Project Documentation Overview</font>

Jelikož je Backend a Server Less architektura složitější, máme kompletně řešenou dokumentaci jak funguje architektura v samostatné sekci.
(<font color="#ff0000">TODO Documentation</font>)


---
## <font color="#00a828">Developing locally - Preparation Phase  (5 minutes step)</font>

1) Everything from [Parent Readme](../README.md)
3) Install Encore Library (tutorial - https://encore.dev/docs/install)
   1) Mac: <font color="#fd8000">$ brew install encoredev/tap/encore</font>
   1) Windows: <font color="#fd8000">$ iwr https://encore.dev/install.ps1 | iex</font>
   2) -> Update: <font color="#fd8000">$ encore version update</font>
4) Log into Encore (https://app.encore.dev/) with Groupon Email (or Ask @Tomas Zaruba for Membership)
5) Auth your encore: <font color="#fd8000">$ encore auth</font>. This will open a browser where you can authorize yourself thanks to the login from the previous step. A security key like SSH (with limited time validity) will be saved to your computer. From now on, Encore knows it's you and all your development activities are recorded. (Every build, every code update)


---
👾👾 All instruction for terminal are prepared to call in directory ./backend 👾👾👾 <br>
In Terminal use `cd backend` 💩



## <font color="#00a828">Run Serverless - Preparation Phase  (10 seconds step)</font>

```bash
encore run
```

While `encore run` is running, open <http://localhost:9400/> to view Encore's [local developer dashboard](https://encore.dev/docs/observability/dev-dash).



## <font color="#00a828">Testing</font>

```bash
encore test
```

## <font color="#00a828">Generate Source for Frontend</font>

```bash
encore gen client test-app-fwsi --output=../frontend/libs/api-source/client.ts --env=local
encore gen client --lang=openapi --output=./client_export/openapi.json --env=local
encore gen client --lang=openapi --output=../open-api/openapi.json --env=local
```

## <font color="#00a828">Others</font>

**Linting**
```bash
npm lint
```




**Linting**
```bash
./dev_script/replace_secret.sh input.ts output.ts "mySuperSecretValue"
```

