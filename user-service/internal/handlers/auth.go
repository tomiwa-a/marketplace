package handlers

import (
	"github.com/gin-gonic/gin"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/controllers"
)

func RegisterAuthRoutes(r *gin.Engine, app *app.Application) {
	authGroup := r.Group("auth")

	authGroup.GET("/validate", controllers.ValidateUserHandler(app))

	authGroup.POST("/signup", controllers.RegisterUserHandler(app))
	authGroup.POST("/login", controllers.UserLoginHandler(app))
	authGroup.PUT("/refresh_token", controllers.UserTokenRefreshHandler(app))
	authGroup.PUT("/activate", controllers.UserActivateHandler(app))
	authGroup.PUT("/send_activation", controllers.SendActivationHandler(app))
	authGroup.PATCH("/reset_password", controllers.UserResetPasswordHandler(app))
	authGroup.POST("/logout", controllers.UserLogoutHandler(app))

}
