# Установка базового образа с нужной версией Go
FROM golang:1.22-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем все файлы проекта в рабочую директорию
COPY . .

# Обновляем зависимости проекта
RUN go mod tidy

# Сборка проекта
RUN go build -o server .

# Второй этап сборки - уменьшение размера образа
FROM alpine:latest

# Установка зависимостей времени выполнения
RUN apk --no-cache add ca-certificates

# Установка рабочей директории
WORKDIR /root/

# Копируем исполняемый файл из предыдущего образа
COPY --from=builder /app/server .

# Переменные окружения для подключения к базе данных PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=kinopoisk123
ENV POSTGRES_DB=kino-poisk
ENV POSTGRES_HOST=db
ENV POSTGRES_PORT=1337

# Открываем порт для веб-сервера
EXPOSE 8080

# Команда для запуска приложения
CMD ["./server"]
