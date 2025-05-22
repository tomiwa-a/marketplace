package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/config"
	"user-service.marketplace.tomiwa.net/internal/data"
	"user-service.marketplace.tomiwa.net/internal/database"
	grpcServer "user-service.marketplace.tomiwa.net/internal/grpc"
	"user-service.marketplace.tomiwa.net/internal/handlers"
)

func main() {
	cfg := config.LoadConfig()
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	// Initialize database
	db, err := database.OpenDB(cfg.DB)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()
	logger.Printf("database connection pool established")

	// Initialize application
	app := app.NewApplication(cfg, logger, data.NewModels(db))

	// Initialize HTTP server
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	handlers.InitializeRoutes(r, app)

	httpServer := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Initialize gRPC server
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		logger.Fatalf("failed to listen on port 50051: %v", err)
	}
	grpcSrv := grpc.NewServer()

	grpcServer.RegisterUserServiceServer(grpcSrv, grpcServer.NewServer(app))

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start HTTP server
	go func() {
		logger.Printf("starting HTTP server on %s", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("HTTP server error: %v", err)
		}
	}()

	// Start gRPC server
	go func() {
		logger.Printf("starting gRPC server on :50051")
		if err := grpcSrv.Serve(lis); err != nil {
			logger.Fatalf("gRPC server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	<-quit
	logger.Println("Shutting down servers...")

	// Shutdown HTTP server
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Printf("HTTP server forced to shutdown: %v", err)
	}

	// Shutdown gRPC server
	grpcSrv.GracefulStop()
	logger.Println("Servers stopped successfully")
}
