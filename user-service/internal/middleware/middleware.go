package middleware

// func Authenticate(app *app.Application, next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		w.Header().Add("Vary", "Authorization")

// 		authorizationHeader := r.Header.Get("Authorization")

// 		if authorizationHeader == "" {
// 			r = contextSetUser(r, data.AnonymousUser)
// 			next.ServeHTTP(w, r)
// 			return
// 		}

// 		headerParts := strings.Split(authorizationHeader, " ")
// 		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
// 			customerrors.InvalidAuthenticationTokenResponse(w, r)
// 			return
// 		}
// 		// Extract the actual authentication token from the header parts.
// 		token := headerParts[1]
// 		// Validate the token to make sure it is in a sensible format.
// 		v := validator.New()
// 		// If the token isn't valid, use the invalidAuthenticationTokenResponse()
// 		// helper to send a response, rather than the failedValidationResponse() helper
// 		// that we'd normally use.
// 		if data.ValidateTokenPlaintext(v, token); !v.Valid() {
// 			customerrors.InvalidAuthenticationTokenResponse(w, r)
// 			return
// 		}

// 		user, err := app.Models.Users.GetForToken(data.ScopeAuthentication, token)
// 		if err != nil {
// 			switch {
// 			case errors.Is(err, data.ErrRecordNotFound):
// 				customerrors.InvalidAuthenticationTokenResponse(w, r)
// 			default:
// 				customerrors.ServerErrorResponse(app, w, r, err)
// 			}
// 			return
// 		}

// 		r = contextSetUser(r, user)

// 		next.ServeHTTP(w, r)

// 	})
// }

// func RequirieAuthenticatedUser(app *app.Application, next http.HandlerFunc) http.HandlerFunc {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		user := ContextGetUser(r)

// 		if user.IsAnonymous() {
// 			customerrors.AuthenticationRequiredResponse(w, r)
// 			return
// 		}

// 		next.ServeHTTP(w, r)

// 	})
// }

// func RequireActivatedUser(app *app.Application, next http.HandlerFunc) http.HandlerFunc {
// 	fn := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		user := ContextGetUser(r)

// 		if !user.Activated {
// 			customerrors.InactiveAccountResponse(w, r)
// 			return
// 		}

// 		next.ServeHTTP(w, r)
// 	})

// 	return RequirieAuthenticatedUser(app, fn)
// }

// func RequirePermission(app *app.Application, codes []string, next http.HandlerFunc) http.HandlerFunc {
// 	fn := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		user := ContextGetUser(r)
// 		permissions, err := app.Models.Permissions.GetAllForUser(user.ID)

// 		if err != nil {
// 			customerrors.ServerErrorResponse(app, w, r, err)
// 			return
// 		}

// 		if !permissions.ContainsAll(codes) {
// 			customerrors.NotPermittedResponse(w, r)
// 			return
// 		}
// 		next.ServeHTTP(w, r)
// 	})

// 	return RequireActivatedUser(app, fn)
// }

// func RateLimit(app *app.Application, next http.Handler) http.Handler {

// 	type client struct {
// 		limiter  *rate.Limiter
// 		lastSeen time.Time
// 	}

// 	var (
// 		mu      sync.Mutex
// 		clients = make(map[string]*client)
// 	)

// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		if !app.Config.Limiter.Enabled {
// 			next.ServeHTTP(w, r)
// 		}

// 		ip, _, err := net.SplitHostPort(r.RemoteAddr)

// 		if err != nil {
// 			customerrors.ServerErrorResponse(app, w, r, err)
// 		}

// 		// Lock the mutex to prevent this code from being executed concurrently.
// 		mu.Lock()

// 		if _, found := clients[ip]; !found {
// 			clients[ip] = &client{limiter: rate.NewLimiter(rate.Limit(app.Config.Limiter.Rps), app.Config.Limiter.Burst)}
// 		}

// 		// Update the last seen time for the client.
// 		clients[ip].lastSeen = time.Now()

// 		if !clients[ip].limiter.Allow() {
// 			mu.Unlock()
// 			customerrors.RateLimitExceededResponse(w, r)
// 			return
// 		}

// 		mu.Unlock()
// 		next.ServeHTTP(w, r)
// 	})
// }

// func RecoverPanic(app *app.Application, next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		defer func() {

// 			if err := recover(); err != nil {
// 				w.Header().Set("Connection", "close")

// 				customerrors.ServerErrorResponse(app, w, r, fmt.Errorf("%s", err))
// 			}
// 		}()
// 		next.ServeHTTP(w, r)
// 	})
// }

// func EnableCORS(app *app.Application, next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		w.Header().Add("Vary", "Origin")

// 		origin := r.Header.Get("Origin")

// 		if origin != "" {

// 			for i := range app.Config.Cors.TrustedOrigins {
// 				if origin == app.Config.Cors.TrustedOrigins[i] {
// 					w.Header().Set("Access-Control-Allow-Origin", origin)
// 				}
// 			}
// 		}

// 		next.ServeHTTP(w, r)
// 	})
// }
