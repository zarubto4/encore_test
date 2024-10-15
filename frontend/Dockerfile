FROM docker-conveyor.groupondev.com/conveyor/alpine-node20.11.0-build:2024.03.22-20.32.50-1ea0706 as build

# e.g. b096bb267e2d7b5c79632a2971e077e56bb51efd
ARG FULL_SHA
ENV grpn_appSha=$FULL_SHA

# optional - set in CI
ARG IAM_METADATA
ENV IAM_METADATA=$IAM_METADATA
ENV NEXT_TELEMETRY_DISABLED=1

ARG PORT=8000
ENV PORT=$PORT

WORKDIR /var/groupon
COPY . .

RUN npm install -g pnpm@9.4.0
RUN pnpm install
RUN pnpm run build

# FROM docker-conveyor.groupondev.com/conveyor/alpine-node20.11.0:2024.03.22-20.32.50-1ea0706 AS release

# COPY --from=build /var/groupon/dist/rbac-ui /var/groupon/dist/rbac-ui

LABEL maintainer="i-tier-devs@groupon.com"
LABEL com.groupon.conveyor.app.service-id="rbac-ui::itier"
LABEL com.groupon.conveyor.app.type="itier"
LABEL com.groupon.conveyor.app.name="rbac-ui"

ARG SHORT_SHA

ARG TAG

ARG OPEN_CONTAINER_DATE
LABEL org.opencontainers.image.revision=$SHORT_SHA
LABEL org.opencontainers.image.version=$TAG
LABEL org.opencontainers.image.created=$OPEN_CONTAINER_DATE

WORKDIR /var/groupon/dist/rbac-ui

ENTRYPOINT ["npm", "start"]
CMD []
