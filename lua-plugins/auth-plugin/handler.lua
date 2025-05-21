local http = require "resty.http"
local cjson = require "cjson"
local jwt = require "resty.jwt"
local kong = kong

local AuthVerificationHandler = {
  VERSION = "1.0",
  PRIORITY = 100 -- Lower than JWT plugin (1000)
}

-- Shared cache
-- local cache = ngx.shared.activation_cache

local function is_user_activated(conf, user_id)
  -- (Keep the existing cache and activation check implementation)
  -- Check cache first
  -- local cached = cache:get(user_id)
  -- if cached ~= nil then
  --   return cached == "true"
  -- end

  local httpc = http.new()
  httpc:set_timeout(conf.timeout)
  
  local url = string.format(conf.activation_endpoint, user_id)
  local res, err = httpc:request_uri(url, {
    method = "GET",
    headers = {
      ["X-INTERNAL-REQUEST"] = "kong-plugin" -- For backend security
    }
  })

  if not res then
    kong.log.err("Activation check failed: ", err)
    return nil, err
  end

  -- if res.status ~= 200 then
  --   return false, "invalid_status"
  -- end

  local data = cjson.decode(res.body)

  local activated = false
  if data and data.user then
    if type(data.user.activated) == "userdata" or data.user.activated == ngx.null then
      activated = false
    else
      activated = data.user.activated == true
    end
  end

  -- kong.log("Activation check result: ", tostring(activated))
  
  -- Cache result
  -- cache:set(user_id, tostring(activated), conf.cache_ttl)

  return activated
end

function AuthVerificationHandler:access(conf)
  -- Helper function to parse cookies
  local function get_cookie(cookie_name)
    local cookie = kong.request.get_header("Cookie")
    if not cookie then return nil end
    
    -- Iterate through cookies
    for c in cookie:gmatch("[^;]+") do
      local key, value = c:match("^%s*(.-)%s*=%s*(.-)%s*$")
      if key == cookie_name then
        return value
      end
    end
    return nil
  end

  -- Get token from cookie
  local auth_token = get_cookie("user_auth_token")
  if not auth_token then
    return  -- Exit silently if no auth cookie
  end

  -- Proceed with JWT verification
  local jwt_obj = jwt:load_jwt(auth_token)
  if not jwt_obj.valid then
    return kong.response.exit(401, { message = "Invalid JWT token" })
  end

  -- Verify signature
  local verified_jwt = jwt:verify_jwt_obj(conf.jwt_secret, jwt_obj)
  if not verified_jwt.verified then
    kong.log.err("JWT verification failed: ", verified_jwt.reason)
    return 
    -- return kong.response.exit(401, { message = "Invalid token signature" })
  end

  -- Extract claims
  local user_id = verified_jwt.payload.id
  local user_role = verified_jwt.payload.user_type
  if not user_id then
    return kong.response.exit(403, { message = "Missing id claim in token" })
  end

  -- Set headers for downstream
  kong.service.request.set_header("X-User-Id", user_id)
  kong.service.request.set_header("X-User-Role", user_role)

  -- Check activation status
  local activated, err = is_user_activated(conf, user_id)
  if err then
    return kong.response.exit(500, { message = "Activation service unavailable" })
  end

  kong.service.request.set_header("X-User-Activated", tostring(activated))
end

return AuthVerificationHandler
