package main

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"time"
)

var rateLimit int64 = 500 //ms
var lastRequestTime int64 = 0
var pendingRequest []string
var dataMap map[string]string = make(map[string]string)

type analyzeRequest struct {
	Prompt string `json:"prompt"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	route := gin.Default()

	gin.SetMode(gin.ReleaseMode)

	route.Static("/img", "./public/img")

	route.Static("/new", "./new-public")

	route.GET("/", func(c *gin.Context) {
		c.File("public/target.html")
	})

	route.GET("/new", func(c *gin.Context) {
		c.File("new-public/index.html")
	})

	route.GET("/retry", func(c *gin.Context) {
		c.File("./retry/retry.html")
		println()
	})

	route.GET("/retry/:path", func(c *gin.Context) {
		c.File("./retry/" + c.Param("path"))
	})

	route.GET("/retry/img/:path", func(c *gin.Context) {
		c.File("./retry/img/" + c.Param("path"))
	})

	route.GET("/:path", func(c *gin.Context) {
		c.File("./public/" + c.Param("path"))
	})

	route.POST("/api/v1/analyze", func(c *gin.Context) {
		println(time.Now().UnixMilli() - lastRequestTime)
		if time.Now().UnixMilli()-lastRequestTime > rateLimit {
			lastRequestTime = time.Now().UnixMilli()
		} else {
			lastRequestTime = time.Now().UnixMilli()
			time.Sleep(time.Duration(time.Now().UnixMilli()-lastRequestTime+rateLimit) * time.Millisecond)
		}
		println(time.Now().UnixMilli() - lastRequestTime)

		var req analyzeRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}
		c.JSON(
			200,
			gin.H{
				"data": analyze(req.Prompt),
			},
		)
	})

	println("open http://127.0.0.1:9580")

	err = route.Run(":9580")
	if err != nil {
		log.Fatal(err)
	}

}
