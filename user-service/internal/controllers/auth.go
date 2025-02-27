package controllers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"user-service.marketplace.tomiwa.net/internal/app"
	"user-service.marketplace.tomiwa.net/internal/customerrors"
	"user-service.marketplace.tomiwa.net/internal/data"
	"user-service.marketplace.tomiwa.net/internal/models"
	"user-service.marketplace.tomiwa.net/internal/utils"
	"user-service.marketplace.tomiwa.net/internal/validator"
)

const (
	USER_ACCESS_KEY  = "user_auth_token"
	USER_REFRESH_KEY = "user_refresh_token"
)

func UserTokenRefreshHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {

		user_refresh_token, err := utils.GetTokenFromCookie(c, USER_REFRESH_KEY)

		if err != nil {
			switch {
			case errors.Is(err, http.ErrNoCookie):
				customerrors.BadRequestResponse(c, errors.New("user_refresh_token cookie not found"))

			case errors.Is(err, models.ErrTokenExpired):
				customerrors.BadRequestResponse(c, models.ErrTokenExpired)
			default:
				customerrors.ServerErrorResponse(app, c, err)
			}
			return
		}

		v := validator.New()

		user, err := app.Models.Users.GetForToken(models.ScopeRefresh, user_refresh_token.Token)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				clearUserTokenFromCookieUtil(c)
				v.AddError("token", "invalid or expired refresh token, login again.")
				customerrors.FailedValidationResponse(c, v.Errors)

			default:
				customerrors.ServerErrorResponse(app, c, err)
			}
		}

		err = generateAuthTokensUtil(app, c, user.PublicID)

		if err != nil {
			customerrors.ServerErrorResponse(app, c, err)
			return
		}

		c.JSON(http.StatusOK,
			gin.H{
				"message": "token refreshed successfully",
			},
		)

	}
}

func RegisterUserHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {

		clearUserTokenFromCookieUtil(c)

		var input struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		err := utils.ReadJSON(c.Writer, c.Request, &input)

		if err != nil {
			customerrors.BadRequestResponse(c, err)
			return
		}

		user := &models.User{
			Name:      input.Name,
			Email:     input.Email,
			Activated: utils.Pointer(false),
			Verified:  utils.Pointer(false),
		}

		user.Password.Set(input.Password)
		//validate input

		v := validator.New()
		models.ValidateUser(v, user)

		if !v.Valid() {
			customerrors.FailedValidationResponse(c, v.Errors)
			return
		}

		err = app.Models.Users.Insert(user)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrDuplicateEmail):
				customerrors.BadRequestResponse(c, errors.New("a user with this email address already exists "))
			default:
				customerrors.ServerErrorResponse(app, c, err)
			}
			return
		}

		err = generateAuthTokensUtil(app, c, user.PublicID)

		if err != nil {
			customerrors.ServerErrorResponse(app, c, err)
			return
		}

		// go routine to kafka message to Notifications Service (send a welcome email + activation)

		c.JSON(http.StatusCreated,
			gin.H{
				"message": "user signed up successfully",
				// "data":    user,
			},
		)
	}
}

func UserLoginHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {

		clearUserTokenFromCookieUtil(c)

		var input struct {
			Email    string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		err := utils.ReadJSON(c.Writer, c.Request, &input)

		if err != nil {
			fmt.Println(err)
			customerrors.BadRequestResponse(c, err)
			return
		}

		v := validator.New()
		models.ValidateEmail(v, input.Email)
		models.ValidatePasswordPlaintext(v, input.Password)

		if !v.Valid() {
			customerrors.FailedValidationResponse(c, v.Errors)
			return
		}

		user, err := app.Models.Users.GetByEmail(input.Email)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				customerrors.InvalidCredentialsResponse(c)
			default:
				customerrors.ServerErrorResponse(app, c, err)
			}

			return
		}

		match, err := user.Password.Matches(input.Password)

		if err != nil {
			customerrors.ServerErrorResponse(app, c, err)
			return
		}

		if !match {
			customerrors.InvalidCredentialsResponse(c)
			return
		}

		err = generateAuthTokensUtil(app, c, user.PublicID)

		if err != nil {
			customerrors.ServerErrorResponse(app, c, err)
			return
		}

		c.JSON(http.StatusOK,
			gin.H{
				"message": "user logged in successfully",
				// "data":    user,
			},
		)
	}
}

func UserLoginWithGoogleHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {}
}

func UserResetPasswordHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {

		//send reset email to user
	}
}

func UserLogoutHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {

		//get the user's ID and delete the refresh token from db.

		clearUserTokenFromCookieUtil(c)

		c.JSON(http.StatusOK,
			gin.H{
				"message": "user logged out successfully",
			},
		)
	}
}

func UserActivateHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			TokenPlaintext string `json:"token"`
		}
		err := utils.ReadJSON(c.Writer, c.Request, &input)

		if err != nil {
			customerrors.BadRequestResponse(c, err)
			return
		}

		v := validator.New()

		models.ValidateTokenPlaintext(v, input.TokenPlaintext)

		if !v.Valid() {
			customerrors.FailedValidationResponse(c, v.Errors)
			return
		}

		user, err := app.Models.Users.GetForToken(models.ScopeActivation, input.TokenPlaintext)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				v.AddError("token", "invalid or expired activation token")
				customerrors.FailedValidationResponse(c, v.Errors)

			default:
				customerrors.BadRequestResponse(c, err)
			}
			return
		}

		user.Activated = utils.Pointer(true)

		err = app.Models.Users.Update(user)
		if err != nil {
			customerrors.ServerErrorResponse(app, c, err)
			return
		}

		err = app.Models.Tokens.DeleteAllForUser(user.PublicID, models.ScopeActivation)

		if err != nil {
			customerrors.ServerErrorResponse(app, c, err)
		}

		c.JSON(http.StatusOK,
			gin.H{
				"message": "user activated successfully",
				"user":    user,
			})
	}
}

func SendActivationHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {}
}

func ValidateUserHandler(app *app.Application) gin.HandlerFunc {
	return func(c *gin.Context) {
		user_access_token, err := utils.GetTokenFromCookie(c, USER_ACCESS_KEY)

		if err != nil {
			switch {
			case errors.Is(err, http.ErrNoCookie):
				customerrors.BadRequestResponse(c, errors.New("user_access_token cookie not found"))

			case errors.Is(err, models.ErrTokenExpired):
				customerrors.BadRequestResponse(c, models.ErrTokenExpired)
			default:
				customerrors.ServerErrorResponse(app, c, err)
			}
			return
		}

		user, err := app.Models.Users.GetByPublicID(user_access_token.ID)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				customerrors.BadRequestResponse(c, errors.New("user not found"))
			default:
				customerrors.ServerErrorResponse(app, c, err)

			}
			return
		}
		c.JSON(http.StatusOK,
			gin.H{
				"message": "user validated successfully",
				"user":    user,
			})
	}
}

//utils

func generateAuthTokensUtil(app *app.Application, c *gin.Context, userID uuid.UUID) error {
	access_token, refresh_token, err := models.CreateUserAuthTokens(userID)

	if err != nil {
		return err
	}

	models.HashToken(refresh_token)
	refresh_token.Scope = models.ScopeRefresh

	err = app.Models.Tokens.DeleteAllForUser(userID, models.ScopeRefresh)

	if err != nil {
		return err
	}

	err = app.Models.Tokens.Insert(refresh_token)

	if err != nil {
		return err
	}

	utils.SetCookie(c, USER_ACCESS_KEY, access_token.Token)
	utils.SetCookie(c, USER_REFRESH_KEY, refresh_token.Token)

	return nil
}

func clearUserTokenFromCookieUtil(c *gin.Context) {
	c.SetCookie(USER_ACCESS_KEY, "", -1, "", "", false, true)
	c.SetCookie(USER_REFRESH_KEY, "", -1, "", "", false, true)
}
