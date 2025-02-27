-- local http = require "resty.http"
-- local cjson = require "cjson"
-- local kong = kong

-- local AuthVerificationHandler = {
--   VERSION = "1.0",
--   PRIORITY = 100 -- Lower than JWT plugin (1000)
-- }

-- -- Shared cache
-- local cache = ngx.shared.activation_cache

-- local function is_user_activated(conf, user_id)
--   -- Check cache first
--   local cached = cache:get(user_id)
--   if cached ~= nil then
--     return cached == "true"
--   end

--   local httpc = http.new()
--   httpc:set_timeout(conf.timeout)
  
--   local url = string.format(conf.activation_endpoint, user_id)
--   local res, err = httpc:request_uri(url, {
--     method = "GET",
--     headers = {
--       ["X-INTERNAL-REQUEST"] = "kong-plugin" -- For backend security
--     }
--   })

--   if not res then
--     kong.log.err("Activation check failed: ", err)
--     return nil, err
--   end

--   if res.status ~= 200 then
--     return false, "invalid_status"
--   end

--   local data = cjson.decode(res.body)
--   local activated = data.user.activated or false
  
--   -- Cache result
--   cache:set(user_id, tostring(activated), conf.cache_ttl)

--   return activated
-- end

-- function AuthVerificationHandler:access(conf)
--   -- Skip for public/anonymous users
--   local consumer = kong.client.get_consumer()
--   if not consumer or consumer.username == "public-user" then
--     return
--   end

--   -- Get user ID from JWT claims
--   local user_id = kong.request.get_header("X-Claim-Sub")
--   if not user_id then
--     return kong.response.exit(403, { message = "Missing user ID in token" })
--   end

--   -- Check activation status
--   local activated, err = is_user_activated(conf, user_id)
  
--   if err then
--     -- Handle external service failure (fail open/closed based on security needs)
--     return kong.response.exit(500, { message = "Activation service unavailable" })
--   end

--   if not activated then
--     return kong.response.exit(403, { message = "Account not activated" })
--   end
-- end

-- return AuthVerificationHandler

local jwt_decoder = require("kong.plugins.jwt.jwt_parser")
local set_header = kong.service.request.set_header

local CustomHandler = {
  VERSION  = "1.0.0",
  PRIORITY = 10,
}


function CustomHandler:access(conf)
  -- Retrieve the token from the context
  local token = kong.ctx.shared.authenticated_jwt_token
  if not token then
    kong.log.warn("Token not found in context")
    
    return kong.response.exit(500, "TEST: Token not found in context")
  end

  local jwt = jwt_decoder:new(token)
  local user_id = jwt.claims.sub
  if not user_id then
    kong.log.warn("'sub' claim not found in JWT")
    
    return kong.response.exit(500, "TEST: 'sub' claim not found in JWT")
  end

  -- set the header
  set_header("X-User-Id", user_id)
end

return CustomHandler