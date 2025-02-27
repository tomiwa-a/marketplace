package handlers

import (
	"github.com/gin-gonic/gin"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/controllers"
)

func RegisterUserRoutes(r *gin.Engine, app *app.Application) {

	RegisterAuthRoutes(r, app)

	r.GET("/", controllers.ListUsersHandler(app))
	r.GET("/:public_id", controllers.UserDetailsHander(app))

	r.PATCH("/", controllers.UserUpdateHandler(app))
	r.PATCH("/password", controllers.UserChangePasswordHandler(app))

	r.DELETE("/", controllers.UserDeleteHandler(app))

}
