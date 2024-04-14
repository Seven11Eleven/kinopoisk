package database

import(
	"log"
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

)

var Pool *pgxpool.Pool

func ConnectToDatabase() *pgxpool.Pool {
	// Строка подключения к базе данных постгря
	connString := "user=postgres dbname=kino-poisk password=kinopoisk123 port=1337 sslmode=disable"

	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		log.Fatalf("Failed to parse config: %v", err)
	}

	config.MaxConns = 5

	dbpool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	if err := dbpool.Ping(ctx); err != nil {
		log.Fatalf("Ping database failed: %v\n", err)
	}

	return dbpool
}