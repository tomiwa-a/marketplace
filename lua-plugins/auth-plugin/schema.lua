local typedefs = require "kong.db.schema.typedefs"

return {
    name = "auth-plugin",
    fields = {
      {
        config = {
          type = "record",
          fields = {
            {jwt_secret = { type = "string", required = true }},
            {activation_endpoint = { type = "string", required = true, default = "http://user-service:2000/%s" }},
            {cache_ttl = { type = "number", default = 60 }}, -- Cache results for 60 seconds
            {timeout = { type = "number", default = 5000 }} -- 5 seconds timeout
          },
        },
      },
    },
  }