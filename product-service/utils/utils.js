function calculateMetaData(totalRecords, page, pageSize) {
  let metadata = {};
  metadata.current_page = Number(page);
  metadata.page_size = Number(pageSize);
  metadata.first_page = 1;
  metadata.last_page = Math.ceil(totalRecords / pageSize);
  metadata.total_records = Number(totalRecords);

  return metadata;
}

function getHeaderUserId(req) {
  return req.headers["x-user-id"] ?? "";
}

function getHeaderUserRole(req) {
  return req.headers["x-user-role"] ?? "";
}

function getHeaderUserActivated(req) {
  return req.headers["x-user-activated"] ?? "";
}

function setDefaultHeaders(req, res, next) {
  req.headers["x-user-id"] =
    req.headers["x-user-id"] || "3f8c9b2e-7d4e-4a2a-9b6e-8f3d2c5a1f4b";
  req.headers["x-user-role"] = req.headers["x-user-role"] || "user";
  req.headers["x-user-activated"] = req.headers["x-user-activated"] || "true";
  next();
}

module.exports = {
  calculateMetaData,
  getHeaderUserId,
  getHeaderUserRole,
  getHeaderUserActivated,
  setDefaultHeaders,
};
