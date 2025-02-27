package data

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"user-service.marketplace.tomiwa.net/internal/models"
)

type TokenModel struct {
	DB *sql.DB
}

func (m TokenModel) New(userID uuid.UUID, ttl time.Duration, scope string) (*models.Token, error) {

	token, err := models.GenerateRandomToken(userID, ttl, scope)

	if err != nil {
		return nil, err
	}

	err = m.Insert(token)

	return token, err
}

func (m TokenModel) Insert(token *models.Token) error {
	query := "INSERT INTO tokens (hash, user_id, expiry, scope) VALUES($1, $2, $3, $4)"

	args := []interface{}{
		token.Hash,
		token.ID,
		token.ExpiresAt,
		token.Scope,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)

	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, args...)

	return err

}

func (m TokenModel) DeleteAllForUser(userID uuid.UUID, scope string) error {

	query := "DELETE FROM tokens WHERE user_id = $1 AND scope = $2"

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)

	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userID, scope)

	return err
}
