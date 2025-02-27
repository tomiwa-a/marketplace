package data

import (
	"database/sql"
	"errors"
)

var (
	ErrRecordNotFound = errors.New("record not found")
	ErrEditConflict   = errors.New("unable to update the record due to an edit conflict, please try again")
	ErrDuplicateEmail = errors.New("duplicate email found")
	ErrUserNotFound   = errors.New("account with email and password not found")
)

type Models struct {
	Users  UserModel
	Tokens TokenModel
}

func NewModels(db *sql.DB) Models {

	return Models{
		Users:  UserModel{DB: db},
		Tokens: TokenModel{DB: db},
	}
}
