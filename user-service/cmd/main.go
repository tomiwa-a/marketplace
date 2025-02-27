package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/config"
	"user-service.marketplace.tomiwa.net/internal/data"
	"user-service.marketplace.tomiwa.net/internal/database"
	"user-service.marketplace.tomiwa.net/internal/handlers"
)

func init() {
	// godotenv.Load()
	// fmt.Println(err)
}

func main() {
	cfg := config.LoadConfig()

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	db, err := database.OpenDB(cfg.DB)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()

	logger.Printf("database connection pool established")

	app := app.NewApplication(cfg, logger, data.NewModels(db))

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Initialize routes
	handlers.InitializeRoutes(r, app)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r, // Use httprouter here
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("Server is shutting down...")
		// Add timeout for graceful shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatal("Server forced to shutdown:", err)
		}
	}()

	logger.Printf("starting %s server on %s", cfg.Env, srv.Addr)
	err = srv.ListenAndServe()
	logger.Fatal(err)
}
