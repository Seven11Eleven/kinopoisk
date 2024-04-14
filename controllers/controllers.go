package controllers

import(
	
	"context"
	"fmt"
	"strconv"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"kinopoisk/database"
	"kinopoisk/models"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)


func RemoveReview(c *gin.Context){
    movieID := c.Param("movieid")

    tokenString := c.GetHeader("Authorization")
	if tokenString ==""{
		c.JSON(401, gin.H{"error": "Authorization token not provided"})
		return
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error){
		return jwtKey, nil
	})
	if err != nil || !token.Valid{
		c.JSON(401, gin.H{"error": "Invalid or expired token"})
		return
	}
	
	claims := token.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(float64)

    var reviewCount int
    if err := database.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM reviews WHERE movie_id = $1 AND user_id = $2", movieID, userID).Scan(&reviewCount); err != nil {
        c.JSON(500, gin.H{"error": "Failed to query database"})
        return
    }
    if reviewCount == 0 {
        c.JSON(404, gin.H{"error": "Review not found"})
        return
    }

    // Удаляем рецензию
    _, err = database.Pool.Exec(context.Background(), "DELETE FROM reviews WHERE movie_id = $1 AND user_id = $2", movieID, userID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to delete review"})
        return
    }

    // Понижаем переменную reviews_count у пользователя
    _, err = database.Pool.Exec(context.Background(), "UPDATE users SET reviews_count = reviews_count - 1 WHERE id = $1", userID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update user reviews count"})
        return
    }

    c.JSON(200, gin.H{"message": "Review deleted successfully"})
}

func GetReviewsMovie(c *gin.Context){
    movieID := c.Param("movieid")


    query := `SELECT * FROM reviews WHERE movie_id = $1`

    rows, err := database.Pool.Query(context.Background(), query, movieID)
    if err != nil{
        c.JSON(500, gin.H{"error": err})
        return
    }
    defer rows.Close()

    var reviews []models.Review

    for rows.Next(){
        var review models.Review
        if err := rows.Scan(&review.ID, &review.UserID, &review.MovieID, &review.Rating, &review.Text, &review.CreatedAt); err != nil {
            c.JSON(500, gin.H{"error": err})
            return
        }
        reviews = append(reviews, review)
    }
    if err := rows.Err(); err != nil {
        c.JSON(500, gin.H{"error": err})
        return 
    }


    c.JSON(200, reviews)
}


func GetUserReviews(c *gin.Context){
    userID := c.Param("userid")

    query := `SELECT id, user_id, movie_id, rating, text, created_at FROM reviews WHERE user_id = $1`

    rows, err := database.Pool.Query(context.Background(), query, userID)
    if err != nil {
        c.JSON(500, gin.H{"error": "an error occurred while receiving user reviews"})
        return 
    }
    defer rows.Close()
    var reviews []models.Review

    for rows.Next() {
        var review models.Review
        if err := rows.Scan(&review.ID, &review.UserID, &review.MovieID, &review.Rating, &review.Text, &review.CreatedAt); err != nil {
            c.JSON(500, gin.H{"error": err})
            return 
        }
        reviews = append(reviews, review)
    }
 
    if err := rows.Err(); err != nil {
        c.JSON(500, gin.H{"error": err})
        return 
    }


    c.JSON(200, reviews)

}

func UpdateAccount(c *gin.Context){
	tokenString := c.GetHeader("Authorization")
	if tokenString ==""{
		c.JSON(401, gin.H{"error": "Authorization token not provided"})
		return
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error){
		return jwtKey, nil
	})
	if err != nil || !token.Valid{
		c.JSON(401, gin.H{"error": "Invalid or expired token"})
		return
	}
	
	claims := token.Claims.(jwt.MapClaims)
	userdID := claims["user_id"].(float64)

	var userUpdate models.User
	if err := c.ShouldBindJSON(&userUpdate); err != nil {
		c.JSON(400, gin.H{"error": err})
		return
	}

	_, err = database.Pool.Exec(context.Background(), `
	UPDATE users
	SET user_name = $1, email = $2
	WHERE id = $3
`, userUpdate.Username, userUpdate.Email, userdID)
	if err != nil{
		c.JSON(500, gin.H{"error": "Oshibka!! Ne poluchilos' izmenit'"})
		return
	}

	c.JSON(200, gin.H{"message": "User updated successfully"})
}

func DeleteAccount(c *gin.Context){
	tokenString := c.GetHeader("Authorization")
	if tokenString ==""{
		c.JSON(401, gin.H{"error": "Authorization token not provided"})
		return
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error){
		return jwtKey, nil
	})
	if err != nil || !token.Valid{
		c.JSON(401, gin.H{"error": "Invalid or expired token"})
		return
	}
	
	claims := token.Claims.(jwt.MapClaims)
	userdID := claims["user_id"].(float64)

	_, err = database.Pool.Exec(context.Background(), "DELETE FROM users WHERE id = $1", userdID)
	if err != nil{
		c.JSON(500, gin.H{"error": "Udalit' ne poluchilos' koroche yo-moyo!!"})
		return
	}

	c.JSON(204, gin.H{"message": "Аккаунт был успешно удалён, возвращайтесь пожалуйста =("})
}

func GetInfoAboutReview(c *gin.Context) {
    tokenString := c.GetHeader("Authorization")
    if tokenString == "" {
        c.JSON(401, gin.H{"error": "Authorization token not provided"})
        return
    }

    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    if err != nil || !token.Valid {
        c.JSON(401, gin.H{"error": "Invalid or expired token"})
        return
    }

    
    claims := token.Claims.(jwt.MapClaims)
    userID := claims["user_id"].(float64)

    movieID, err := strconv.ParseUint(c.Param("movieid"), 10, 32)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid movie ID"})
        return
    }

	fmt.Println(movieID)
	fmt.Println(userID)

    var reviewInfo models.Review
	reviewInfo.UserID = uint(userID)
	reviewInfo.MovieID = movieID
	fmt.Println(reviewInfo.MovieID)
	fmt.Println(reviewInfo.UserID)
    err = database.Pool.QueryRow(context.Background(), "SELECT * FROM reviews WHERE user_id = $1 AND movie_id = $2", reviewInfo.UserID, reviewInfo.MovieID).Scan(&reviewInfo.UserID, &reviewInfo.UserID, &reviewInfo.MovieID, &reviewInfo.Rating, &reviewInfo.Text, &reviewInfo.CreatedAt)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to get review info"})
        return
    }

    c.JSON(200, gin.H{"review_info": reviewInfo})
}


func AddReview(c *gin.Context) {
    tokenString := c.GetHeader("Authorization")
    if tokenString == "" {
        c.JSON(401, gin.H{"error": "Authorization token not provided"})
        return
    }

      token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    if err != nil || !token.Valid {
        c.JSON(401, gin.H{"error": "Invalid or expired token"})
        return
    }

    claims := token.Claims.(jwt.MapClaims)
    userID := claims["user_id"].(float64) 

    var review models.Review
    if err := c.ShouldBind(&review); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request body"})
        return
    }
	review.MovieID, _ = strconv.ParseUint(c.Param("movieid"), 10, 32)
	
    review.UserID = uint(userID)

	var count int
    err = database.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM reviews WHERE user_id = $1 AND movie_id = $2", review.UserID, review.MovieID).Scan(&count)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to check review existence"})
        return
    }
    if count > 0 {
        c.JSON(400, gin.H{"error": "Review from this user already exists for this movie"})
        return
    }

    
    _, err = database.Pool.Exec(context.Background(), "INSERT INTO reviews (user_id, movie_id, rating, text) VALUES ($1, $2, $3, $4)", review.UserID, review.MovieID, review.Rating, review.Text)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to add review"})
        return
    }


    _, err = database.Pool.Exec(context.Background(), "UPDATE users SET reviews_count = reviews_count + 1 WHERE id = $1", userID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update user reviews count"})
        return
    }

    c.JSON(201, gin.H{"message": "Review added successfully"})
}





var jwtKey = []byte("my_secret_key")



func SignUp(c *gin.Context) {
	var newUser models.User
	if err := c.ShouldBind(&newUser); err != nil {
		c.JSON(400, gin.H{"error": err})
		return
	}
	_, err := GetUserByEmail(newUser.Email)
	if err == nil {
		c.JSON(400, gin.H{"error": "User with this email already exists"})
		return
	}
	if err := CreateUser(newUser); err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}
	c.JSON(200, gin.H{"message": "User signed up successfully"})
}

func CreateUser(user models.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	fmt.Println(user.Username)
	fmt.Println(user.Email)
	fmt.Println(user.Password)
	if err != nil {
		return err
	}
	_, err = database.Pool.Exec(context.Background(), "INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3)", user.Username, user.Email, string(hashedPassword))
	if err != nil {
		return err
	}
	return nil
}


func SignIn(c *gin.Context) {
    var creds models.Credentials
    if err := c.ShouldBind(&creds); err != nil {
        c.JSON(400, gin.H{"error": "Invalid data provided"})
        return
    }

    // Проверка существования пользователя в базе данных
    user, err := GetUserByEmail(creds.Email)
    if err != nil {
        c.JSON(401, gin.H{"error": "Invalid email or password"})
        return
    }

    // Проверка соответствия введенного пароля хэшированному паролю в базе данных
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password)); err != nil {
        c.JSON(401, gin.H{"error": "Invalid password"})
        return
    }

    // Генерация JWT токена с дополнительными данными
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["email"] = user.Email
    claims["user_id"] = user.ID  // Добавление идентификатора пользователя в токен
    claims["exp"] = time.Now().Add(time.Hour * 24).Unix() // Срок действия токена (5 минут)

    // Подпись токена
    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to generate token"})
        return
    }

    // Возвращаем токен клиенту
    c.JSON(200, gin.H{"token": tokenString})
}

func GetUserByEmail(email string) (*models.User, error) {
	user_email := email
	var user models.User
	err := database.Pool.QueryRow(context.Background(), "SELECT id, user_name, email, reviews_count, password_hash FROM users WHERE email = $1", user_email).
		Scan(&user.ID, &user.Username, &user.Email, &user.NumReviews, &user.Password)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserInfoByID(c *gin.Context) {
    user_id := c.Param("id")
    var userInfo struct {
        UserName     string `json:"user_name"`
        Email        string `json:"email"`
        ReviewsCount int    `json:"reviews_count"`
    }

    err := database.Pool.QueryRow(context.Background(), "SELECT user_name, email, reviews_count FROM users WHERE id = $1", user_id).
        Scan(&userInfo.UserName, &userInfo.Email, &userInfo.ReviewsCount)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, userInfo)
}

