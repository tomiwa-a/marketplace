package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/customerrors"
	"user-service.marketplace.tomiwa.net/internal/data"
	"user-service.marketplace.tomiwa.net/internal/models"
	"user-service.marketplace.tomiwa.net/internal/utils"
	"user-service.marketplace.tomiwa.net/internal/validator"
)

func UserDetailsHander(app *app.Application) gin.HandlerFunc {

	return func(c *gin.Context) {

		public_id := c.Param("public_id")
		v := validator.New()

		fmt.Println("show public id here : ", public_id)

		v.Check(public_id != "", "public_id", " must not be empty")
		v.Check(uuid.Validate(public_id) == nil, "public id", "is not a valid ID")

		if !v.Valid() {
			customerrors.FailedValidationResponse(c, v.Errors)
			return
		}

		parsed_id, _ := uuid.Parse(public_id)

		user, err := app.Models.Users.GetByPublicID(parsed_id)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				customerrors.BadRequestResponse(c, err)
			default:
				customerrors.ServerErrorResponse(app, c, err)
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "user fetched successfully",
			"user":    user,
		})
	}
}

func UserChangePasswordHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			CurrentPassword string `json:"current_password" binding:"required"`
			NewPassword     string `json:"new_password" binding:"required"`
		}

		err := utils.ReadJSON(c.Writer, c.Request, &input)

		if err != nil {
			customerrors.BadRequestResponse(c, err)
			return
		}
	}
}

func UserUpdateHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {}
}

func UserDeleteHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {

	}
}

func ListUsersHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userFilter models.UserFilter

		userFilter.User.Name = c.Query("name")
		userFilter.User.Email = c.Query("email")
		userFilter.User.PhoneNumber = c.Query("phone_number")
		userFilter.User.Address = c.Query("address")

		if c.Query("activated") == "" {
			userFilter.User.Activated = nil
		} else {
			userFilter.User.Activated = utils.Pointer(c.Query("activated") == "true")
		}

		if c.Query("verified") == "" {
			userFilter.User.Verified = nil
		} else {
			userFilter.User.Verified = utils.Pointer(c.Query("verified") == "true")
		}

		if ratingFrom := c.Query("rating_from"); ratingFrom != "" {
			if val, err := strconv.ParseFloat(ratingFrom, 64); err == nil {
				userFilter.RatingsFrom = &val
			}
		}
		if ratingTo := c.Query("rating_to"); ratingTo != "" {
			if val, err := strconv.ParseFloat(ratingTo, 64); err == nil {
				userFilter.RatingsTo = &val
			}
		}

		var filter data.Filters
		filter.Page = utils.ReadQueryInt(c.Request.URL.Query(), "page", 1)
		filter.PageSize = utils.ReadQueryInt(c.Request.URL.Query(), "page_size", 20)
		filter.Sort = utils.ReadQueryString(c.Request.URL.Query(), "sort", "-id")
		filter.SortSafelist = []string{"-id", "-rating"}

		users, metadata, err := app.Models.Users.ListUsers(filter, userFilter)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				c.JSON(http.StatusOK, gin.H{
					"message":  "no users fetched",
					"users":    []models.User{},
					"metadata": metadata,
				})
			default:
				customerrors.BadRequestResponse(c, err)

			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "users fetched successfully",
			"users":    users,
			"metadata": metadata,
		})
	}
}
