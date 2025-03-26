FROM golang:1.23-alpine AS builder

RUN apk add --no-cache gcc musl-dev 

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -o main .

FROM alpine:latest

RUN apk add --no-cache sqlite 

WORKDIR /app

RUN mkdir -p /app/data

COPY data/scripts.sql /app/data/
COPY entrypoint.sh /app/

COPY --from=builder /app/main .

RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

CMD ["/app/entrypoint.sh"]