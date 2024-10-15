FROM alpine:3.18 as build-dev
ENV NODE_VERSION 20.12.2
WORKDIR /var/groupon
COPY . .
RUN source .envrc  && vpcs install docker-node
EXPOSE 3000
CMD [ "/bin/bash" ]