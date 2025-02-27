package models

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"user-service.marketplace.tomiwa.net/internal/validator"
)

const (
	UserType  = "user"
	AdminType = "admin"
)

const (
	ScopeRefresh    = "refresh"
	ScopeActivation = "activation"
)

var (
	ErrToken        = errors.New("invalid token")
	ErrTokenExpired = errors.New("the token is expired, login again")
)

type Token struct {
	Token     string    `json:"token"`
	Hash      []byte    `json:"-"`
	ID        uuid.UUID `json:"-"`
	ExpiresAt time.Time `json:"expiry"`
	UserType  string    `json:"-"`
	Scope     string    `json:"-"`
}

func ValidateTokenPlaintext(v *validator.Validator, tokenPlaintext string) {
	v.Check(tokenPlaintext != "", "token", "must be provided")
	v.Check(len(tokenPlaintext) == 26, "token", "must be 26 bytes long")
}

func GenerateRandomToken(userID uuid.UUID, ttl time.Duration, scope string) (*Token, error) {

	token := &Token{
		ID:        userID,
		ExpiresAt: time.Now().Add(ttl),
		Scope:     scope,
	}

	// Initialize a zero-valued byte slice with a length of 16 bytes.
	randomBytes := make([]byte, 16)

	_, err := rand.Read(randomBytes)
	if err != nil {
		return nil, err
	}
	token.Token = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(randomBytes)
	HashToken(token)
	return token, nil
}

func HashToken(token *Token) {
	hash := sha256.Sum256([]byte(token.Token))
	token.Hash = hash[:]
}

func GenerateJWTToken(userId uuid.UUID, userType string, expiry int64) (*Token, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss":       "user-issuer",
		"id":        userId.String(),
		"exp":       expiry,
		"user_type": userType,
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	if err != nil {
		return nil, err
	}

	tokenData := &Token{
		Token:     tokenString,
		ID:        userId,
		ExpiresAt: time.Unix(expiry, 0),
		UserType:  userType,
	}

	return tokenData, nil
}

func ValidateJWTToken(token *Token) error {

	tokenData, err := jwt.Parse(token.Token, func(token *jwt.Token) (interface{}, error) {

		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {

			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return nil
	}

	if claims, ok := tokenData.Claims.(jwt.MapClaims); ok {
		fmt.Println(claims["exp"].(float64), float64(time.Now().Unix()))
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			return ErrTokenExpired
		}

		token.ID, err = uuid.Parse(claims["id"].(string))

		if err != nil {
			return ErrToken
		}

		token.ExpiresAt = time.Unix(int64(claims["exp"].(float64)), 0)
		token.UserType = claims["user_type"].(string)
	} else {
		return ErrToken
	}

	return nil
}

func CreateUserAuthTokens(userId uuid.UUID) (accessToken *Token, refreshToken *Token, error error) {
	access_token_expiry := time.Now().Add(time.Minute * 30).Unix()
	access_token, err := GenerateJWTToken(userId, UserType, access_token_expiry)

	if err != nil {
		return nil, nil, err
	}

	refresh_token_expiry := time.Now().Add(time.Hour * 24).Unix()
	reresh_token, err := GenerateJWTToken(userId, UserType, refresh_token_expiry)

	if err != nil {
		return nil, nil, err
	}

	return access_token, reresh_token, nil
}
