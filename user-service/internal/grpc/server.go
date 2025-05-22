package grpc

import (
	context "context"

	"github.com/google/uuid"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	"user-service.marketplace.tomiwa.net/internal/app"
)

type Server struct {
	UnimplementedUserServiceServer
	app *app.Application
}

func NewServer(app *app.Application) *Server {
	return &Server{app: app}
}

func (s *Server) GetUser(ctx context.Context, in *UserId) (*User, error) {
	// fmt.Printf("Received request for UserID: %s\n", in.UserId)

	parsedUserId, err := uuid.Parse(in.UserId)
	if err != nil {
		return nil, err
	}

	user, err := s.app.Models.Users.GetByPublicID(parsedUserId)
	if err != nil {
		return nil, err
	}

	return &User{
		PublicId:    user.PublicID.String(),
		Name:        user.Name,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		Address:     user.Address,
		Rating:      user.Rating,
		Activated:   *user.Activated,
		Verified:    *user.Verified,
		CreatedAt:   timestamppb.New(user.CreatedAt),
		LastSeen:    timestamppb.New(user.LastSeen),
	}, nil
}

func (s *Server) GetMultipleUsers(ctx context.Context, in *UserIdList) (*UserResponseList, error) {

	parsedUserIds := make([]uuid.UUID, len(in.UserIds))
	for i, id := range in.UserIds {
		parsedId, err := uuid.Parse(id)
		if err != nil {
			return nil, err
		}
		parsedUserIds[i] = parsedId
	}

	users, err := s.app.Models.Users.GetByMultiplePublicIDs(parsedUserIds)
	if err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return &UserResponseList{
			Users: []*User{},
		}, nil
	}

	userResponses := make([]*User, len(users))
	for i, user := range users {
		userResponses[i] = &User{
			PublicId:    user.PublicID.String(),
			Name:        user.Name,
			Email:       user.Email,
			PhoneNumber: user.PhoneNumber,
			Address:     user.Address,
			Rating:      user.Rating,
			// Activated:   *user.Activated,
			// Verified:    *user.Verified,
			CreatedAt: timestamppb.New(user.CreatedAt),
			LastSeen:  timestamppb.New(user.LastSeen),
		}
	}
	return &UserResponseList{
		Users: userResponses,
	}, nil

}

func (s *Server) GetUsers(ctx context.Context, in *Empty) (*UserResponseList, error) {
	// TODO: Implement getting all users
	return &UserResponseList{}, nil
}
