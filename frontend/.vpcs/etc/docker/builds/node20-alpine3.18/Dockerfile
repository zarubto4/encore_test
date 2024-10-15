FROM alpine:3.18 AS build-dev
ENV NODE_VERSION 20.12.2
WORKDIR /var/groupon
COPY . .
RUN source .envrc  && vpcs install docker-node
COPY /var/groupon/.vpcs/etc/docker/builds/node20-alpine3.18/docker.entrypoint.sh /var/groupon/run.sh
ENTRYPOINT [ "run.sh" ]
CMD [ "/bin/bash" ]