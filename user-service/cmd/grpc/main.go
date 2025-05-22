package main

import (
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"google.golang.org/grpc"
	_ "user-service.marketplace.tomiwa.net/internal/config"
	server "user-service.marketplace.tomiwa.net/internal/grpc"
)

func main() {
	// cfg := config.LoadConfig()
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		logger.Fatalf("failed to listen on port 50051: %v", err)
	}

	s := grpc.NewServer()
	server.RegisterUserServiceServer(s, &server.Server{})
	logger.Printf("gRPC server listening at %v", lis.Addr())

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		logger.Println("gRPC Server is shutting down...")
		s.GracefulStop()
	}()

	if err := s.Serve(lis); err != nil {
		logger.Fatalf("failed to serve: %v", err)
	}
}
