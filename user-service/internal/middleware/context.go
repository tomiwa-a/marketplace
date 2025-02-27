package middleware

import (
	"context"
	"net/http"

	"user-service.marketplace.tomiwa.net/internal/models"
)

type contextKey string

const userContextKey = contextKey("user")

func contextSetUser(r *http.Request, user *models.User) *http.Request {

	ctx := context.WithValue(r.Context(), userContextKey, user)
	return r.WithContext(ctx)
}

func ContextGetUser(r *http.Request) *models.User {
	user, ok := r.Context().Value(userContextKey).(*models.User)
	if !ok {
		panic("missing user value in request context")
	}

	return user
}
