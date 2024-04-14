package main

import (
	


	"github.com/gin-gonic/gin"
	"github.com/kinopoisk/controllers"
	"kinopoisk/database"
	
)


// authMiddleware := func(c *gin.Context) {
	// 	// Получаем токен из запроса
	// 	tokenString := c.GetHeader("token")

	// 	// Проверяем наличие токена
	// 	if tokenString == "" {
	// 		// Если токен отсутствует, перенаправляем пользователя на страницу регистрации
	// 		c.Redirect(http.StatusFound, "/auth/register")
	// 		c.Abort()
	// 		return
	// 	}

	// 	// Проверяем валидность токена
	// 	claims := &Claims{}
	// 	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
	// 		return jwtKey, nil
	// 	})
	// 	if err != nil || !token.Valid {
	// 		// Если токен невалиден, перенаправляем пользователя на страницу регистрации
	// 		c.Redirect(400, "/auth/register")
	// 		c.Abort()
	// 		return
	// 	}

	// 	// Если токен валиден, добавляем информацию о пользователе к контексту запроса
	// 	c.Set("username", claims.Username)
	// }


// User структура для хранения информации о пользователе



func main() {
	// Инициализация подключения к базе данных
	dbpool := database.ConnectToDatabase()
	defer dbpool.Close()

	database.Pool = dbpool

	router := gin.Default()

	

	router.Static("/static", "./static")
	router.LoadHTMLGlob("templates/*")

	router.GET("/", func(c *gin.Context) {
		c.HTML(200,"kinoizdeu.html", nil)
	})
	router.GET("/auth/login", func(c *gin.Context) {
		c.HTML(200,"login.html", nil)
	})
	router.GET("/auth/register", func(c *gin.Context) {
		c.HTML(200,"register.html", nil)
	})
	router.POST("/auth/signup", controllers.SignUp)
	router.POST("/auth/signin", controllers.SignIn)

	router.GET("/profile/:id", func(c *gin.Context) {
		c.HTML(200,"profile.html",nil)
	})
	router.GET("/movie/:movieid", func(c *gin.Context){
		c.HTML(200,"movie.html", nil)
	})

	api := router.Group("/api")
	{
		api.GET("/getUserInfo/:id", 		 controllers.GetUserInfoByID)
		api.GET("/getreviewinfo/:movieid",   controllers.GetInfoAboutReview)
		api.GET("/getUserReviews/:userid",   controllers.GetUserReviews)
		api.GET("/getReviewsMovie/:movieid", controllers.GetReviewsMovie)
		api.POST("/addreview/:movieid", 	 controllers.AddReview)
		api.POST("/updateaccount/", 		 controllers.UpdateAccount)
		api.DELETE("/deleteaccount/", 	 	 controllers.DeleteAccount)
		api.DELETE("/deletereview/:movieid", controllers.RemoveReview)

	}

	router.Run(":8080")
}
