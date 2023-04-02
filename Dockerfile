FROM postgrest/postgrest:v9.0.1 as postgrest

FROM debian:bullseye as builder

ARG NODE_VERSION=16.19.1
ARG YARN_VERSION=1.22.19

RUN apt-get update; apt install -y curl python-is-python3 pkg-config build-essential
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION} yarn@${YARN_VERSION}

#######################################################################

RUN mkdir /build
WORKDIR /build

ENV NODE_ENV production

COPY . .

RUN cd /build/server && yarn build-production

FROM debian:bullseye

LABEL fly_launch_runtime="nodejs"

COPY --from=postgrest /bin/postgrest /bin/postgrest

COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /build/server /app

WORKDIR /app
ENV NODE_ENV production
ENV PATH /root/.volta/bin:$PATH

CMD [ "yarn", "run", "start" ]
