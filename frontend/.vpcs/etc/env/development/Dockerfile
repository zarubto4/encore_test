FROM alpine:3.18 as build-dev
ENV NODE_VERSION 20.12.2
WORKDIR /var/groupon
COPY . .
COPY --chmod=755 .vpcs .vpcs
COPY --chmod=755 .env .env
COPY .env/base.profile .env/base.profile
COPY .envrc .envrc
RUN  setup.sh
EXPOSE 3000
CMD [ "/bin/bash" ]