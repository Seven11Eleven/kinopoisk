package models

import(
	"time"
	
	"github.com/dgrijalva/jwt-go"
)

// Структура, которая собой представляет модель пользователя в postgreSQL бд
type User struct {
	ID         uint   `form:"id"`
	Username   string `form:"username"`
	Email      string `form:"email"`
	Password   string `form:"password"`
	NumReviews uint   `form:"num_reviews" db:"default:0"`
}


// Структура для выдачи жвт-токена
type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// Структура для проверки учетных данных пользователя при аутентификации
type Credentials struct {
	Email    string `form:"email"`
	Password string `form:"password"`
}


type Review struct{
	ID 			uint      `json:"review_id"`
	UserID  	uint      `json:"user_id"`
	MovieID 	uint64      `json:"movie_id"`
	Rating  	uint16    `json:"rating"`
	Text    	string    `json:"text"`
	CreatedAt   time.Time `json:created_at`
}