package database

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func ConnectToDatabase() *pgxpool.Pool {
	// Параметры подключения к базе данных
	host := "db"     // Замените на IP-адрес или DNS-имя вашего сервера с PostgreSQL
	port := "5432"          // Порт, на котором слушает PostgreSQL
	database := "kino-poisk"
	user := "postgres"
	password := "kinopoisk123"  // Пароль пользователя базы данных

	// Строка подключения
	connString := "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + database + "?sslmode=disable"

	dbpool, err := pgxpool.New(context.Background(), connString)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	// Установка максимального количества соединений
	dbpool.Config().MaxConns = 5

	// Проверка соединения с базой данных
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	if err := dbpool.Ping(ctx); err != nil {
		log.Fatalf("Ping database faiыыled: %v\n", err)
	}

	return dbpool
}
