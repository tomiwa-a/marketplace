package handlers

import (
	"github.com/gin-gonic/gin"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/customerrors"
)

func InitializeRoutes(r *gin.Engine, app *app.Application) {

	r.NoRoute(customerrors.NotFoundResponse)
	r.NoMethod(customerrors.MethodNotAllowedResponse)

	// Register all route groups here
	RegisterUserRoutes(r, app)
}
