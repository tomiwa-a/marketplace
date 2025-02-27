package app

import (
	"log"

	"user-service.marketplace.tomiwa.net/internal/config"
	"user-service.marketplace.tomiwa.net/internal/data"
)

type Application struct {
	Config config.Config
	Logger *log.Logger
	Models data.Models
}

func NewApplication(cfg config.Config, logger *log.Logger, models data.Models) *Application {

	return &Application{Config: cfg, Logger: logger, Models: models}
}
