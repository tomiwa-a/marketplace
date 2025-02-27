package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"user-service.marketplace.tomiwa.net/internal/validator"
)

type User struct {
	ID          int64     `json:"-"`
	PublicID    uuid.UUID `json:"public_id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Password    password  `json:"-"`
	Address     string    `json:"address"`
	PhoneNumber string    `json:"phone_number"`
	Activated   *bool     `json:"activated"`
	Verified    *bool     `json:"verified"`
	CreatedAt   time.Time `json:"created_at"`
	LastSeen    time.Time `json:"last_seen"`
	Version     int       `json:"-"`
	Rating      float64   `json:"rating"`
}

type password struct {
	plaintext *string
	Hash      []byte
}

type UserFilter struct {
	User        User
	RatingsFrom *float64
	RatingsTo   *float64
}

func ValidateUser(v *validator.Validator, user *User) {
	v.Check(user.Name != "", "name", "must be provided")
	v.Check(len(user.Name) <= 100 && len(user.Name) >= 6, "name", "must be beween 6 and 100 characters long")
	ValidateEmail(v, user.Email)
	if user.Password.plaintext != nil {
		ValidatePasswordPlaintext(v, *user.Password.plaintext)
	}
	if user.Password.Hash == nil {
		panic("missing password hash for user")
	}
}

func ValidateEmail(v *validator.Validator, email string) {
	v.Check(email != "", "email", "must be provided")
	v.Check(validator.Matches(email, validator.EmailRX), "email", "must be a valid email address")
}

func ValidatePasswordPlaintext(v *validator.Validator, password string) {
	v.Check(password != "", "password", "must be provided")
	v.Check(len(password) >= 8, "password", "must be at least 8 characters")
	v.Check(len(password) <= 72, "password", "must not be more than 72 characters")
}

// The Set() method calculates the bcrypt hash of a plaintext password, and stores both
// the hash and the plaintext versions in the struct.
func (p *password) Set(plaintextPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintextPassword), 12)
	if err != nil {
		return err
	}
	p.plaintext = &plaintextPassword
	p.Hash = hash

	// fmt.Println(string(hash))
	return nil
}

// The Matches() method checks whether the provided plaintext password matches the
// hashed password stored in the struct, returning true if it matches and false
// otherwise.
func (p *password) Matches(plaintextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.Hash, []byte(plaintextPassword))
	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}
