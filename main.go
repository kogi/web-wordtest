package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
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

	println("open http://127.0.0.1:9580")

	err := route.Run(":9580")
	if err != nil {
		log.Fatal(err)
	}

}
