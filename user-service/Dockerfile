FROM golang:1.23.6

WORKDIR /app

# Install PostgreSQL client tools
RUN apt-get update && apt-get install -y postgresql-client

# Install migrate tool
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.tar.gz | tar xvz
RUN mv migrate /usr/local/bin/migrate
RUN chmod +x /usr/local/bin/migrate

COPY go*.mod ./

RUN go mod download

COPY . . 

# ENV USER_DB_DSN = postgres://postgres:root@localhost/marketplace_users?sslmode=disable

COPY /entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 2000

ENTRYPOINT ["/entrypoint.sh"]

# CMD ["go", "run", "cmd/main.go"]
