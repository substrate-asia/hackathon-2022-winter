FROM golang:1.19 as builder

ADD . /app

WORKDIR /app

ENV GO111MODULE on
ENV GOPROXY https://goproxy.cn

RUN go mod tidy && go build -o a-line-cli


FROM ubuntu:latest
RUN apt update &&\
    apt install -y apt-transport-https ca-certificates curl git gnupg

RUN curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
RUN chmod a+r /etc/apt/keyrings/docker.gpg
RUN echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu bionic stable" > /etc/apt/sources.list.d/docker.list
RUN apt-get update && \
    apt-get install -y -qq --no-install-recommends docker-ce-cli

COPY --from=builder /app/a-line-cli /usr/local/bin/

EXPOSE 8080

CMD ["/usr/local/bin/a-line-cli","daemon"]
