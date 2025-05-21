package data

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"user-service.marketplace.tomiwa.net/internal/models"
)

type UserModel struct {
	DB *sql.DB
}

func (m UserModel) GetForToken(scope string, tokenPlaintext string) (*models.User, error) {

	tokenHash := sha256.Sum256([]byte(tokenPlaintext))
	var user models.User

	query := `
	SELECT a.id, a.public_id, a.name, a.email, a.password_hash, a.address, a.phone_number, a.activated, a.verified, a.created_at, a.last_seen, a.version, a.rating 
	FROM users a
	INNER JOIN tokens b
	ON a.id = b.user_id
	WHERE hash = $1  
	AND scope = $2 
	AND expiry > $3
	`

	args := []interface{}{tokenHash[:], scope, time.Now()}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)

	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(
		&user.ID,
		&user.PublicID,
		&user.Name,
		&user.Email,
		&user.Password.Hash,
		&user.Address,
		&user.PhoneNumber,
		&user.Activated,
		&user.Verified,
		&user.CreatedAt,
		&user.LastSeen,
		&user.Version,
		&user.Rating,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &user, err
}

func (m UserModel) Insert(user *models.User) error {

	query := `
	INSERT INTO users(name, email, password_hash, address, phone_number, activated, verified)
	VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, public_id, created_at, last_seen, version, rating
	`

	args := []interface{}{
		user.Name,
		user.Email,
		user.Password.Hash,
		user.Address,
		user.PhoneNumber,
		*user.Activated,
		*user.Verified,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(
		&user.ID,
		&user.PublicID,
		&user.CreatedAt,
		&user.LastSeen,
		&user.Version,
		&user.Rating,
	)

	if err != nil {
		switch {
		case err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"`:
			return ErrDuplicateEmail
		default:
			return err
		}
	}

	return nil
}

func (m UserModel) GetByEmail(email string) (*models.User, error) {
	query := `
	SELECT id, public_id, name, email, password_hash, address, phone_number, created_at, last_seen, version, rating
	FROM users
	WHERE email = $1
	`
	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	err := m.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.PublicID,
		&user.Name,
		&user.Email,
		&user.Password.Hash,
		&user.Address,
		&user.PhoneNumber,
		&user.CreatedAt,
		&user.LastSeen,
		&user.Version,
		&user.Rating,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}
	return &user, nil
}

func (m UserModel) Update(user *models.User) error {

	query := `
	UPDATE users SET 
	name = $1, email = $2, password_hash = $3, address = $4, phone_number = $5, activated = $6, verified = $7, rating = $8 version = version + 1
	WHERE id = $9 AND version = $10
	RETURNING version
	`

	args := []interface{}{
		user.Name,
		user.Email,
		user.Password.Hash,
		user.Address,
		user.PhoneNumber,
		*user.Activated,
		*user.Verified,
		user.Rating,
		user.ID,
		user.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&user.Version)

	if err != nil {
		return err
	}

	return nil
}

func (m UserModel) GetByPublicID(userID uuid.UUID) (*models.User, error) {
	query := `
	SELECT id, public_id, name, email, password_hash, address, phone_number, created_at, last_seen, version, rating, activated, verified
	FROM users
	WHERE public_id = $1
	`
	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	err := m.DB.QueryRowContext(ctx, query, userID).Scan(
		&user.ID,
		&user.PublicID,
		&user.Name,
		&user.Email,
		&user.Password.Hash,
		&user.Address,
		&user.PhoneNumber,
		&user.CreatedAt,
		&user.LastSeen,
		&user.Version,
		&user.Rating,
		&user.Activated,
		&user.Verified,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}
	return &user, nil
}

func (m UserModel) ListUsers(f Filters, uf models.UserFilter) ([]models.User, Metadata, error) {
	query := `
	SELECT count(*) OVER() as total_records, id, public_id, name, email, password_hash, address, phone_number, created_at, last_seen, version, rating, activated, verified
	FROM users
	WHERE (to_tsvector('simple', name) @@ plainto_tsquery('simple', $1) OR $1 = '')
	AND (email = $2 OR $2 = '')
	AND (phone_number = $3 OR $3 = '')
	AND (address = $4 OR $4 = '') 
	`

	if uf.User.Activated != nil {
		query += fmt.Sprintf(" AND activated = %v ", *uf.User.Activated)
	}

	if uf.User.Verified != nil {
		query += fmt.Sprintf(" AND verified = %v ", *uf.User.Verified)
	}

	if uf.RatingsFrom != nil {
		query += fmt.Sprintf(" AND rating >= %f ", *uf.RatingsFrom)
	}

	if uf.RatingsTo != nil {
		query += fmt.Sprintf(" AND rating <= %f ", *uf.RatingsTo)
	}

	query += fmt.Sprintf(" ORDER BY %s %s, id ASC ", f.sortColumn(), f.sortDirection())

	query += " LIMIT $5 OFFSET $6 "

	args := []interface{}{uf.User.Name, uf.User.Email, uf.User.PhoneNumber, uf.User.Address, f.limit(), f.offset()}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)

	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, args...)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, Metadata{}, ErrRecordNotFound
		default:
			return nil, Metadata{}, err
		}
	}

	defer rows.Close()

	var users []models.User
	var totalRecords int

	for rows.Next() {
		user := models.User{}
		err := rows.Scan(
			&totalRecords, // This will get the total count
			&user.ID,
			&user.PublicID,
			&user.Name,
			&user.Email,
			&user.Password.Hash,
			&user.Address,
			&user.PhoneNumber,
			&user.CreatedAt,
			&user.LastSeen,
			&user.Version,
			&user.Rating,
			&user.Activated,
			&user.Verified,
		)

		if err != nil {
			return nil, Metadata{}, nil
		}

		users = append(users, user)
	}

	if rows.Err() != nil {

		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, f.Page, f.PageSize)

	if len(users) == 0 {
		return nil, metadata, ErrRecordNotFound
	}

	return users, metadata, nil
}

func (m UserModel) Delete(user *models.User) error {
	return nil
}
