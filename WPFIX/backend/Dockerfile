# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o /out/api ./cmd/server


FROM alpine:3.20

RUN apk add --no-cache ca-certificates \
    && adduser -D -h /app app

COPY --from=build /out/api /usr/local/bin/api

USER app
WORKDIR /app

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/api"]