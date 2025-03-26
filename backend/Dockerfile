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

COPY --from=builder /app/main .

EXPOSE 8080

COPY <<EOF /app/entrypoint.sh
#!/bin/sh
if [ ! -f /app/data/dhcp-flow.db ]; then
    sqlite3 /app/data/dhcp-flow.db < /app/data/scripts.sql
fi
./main
EOF

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]