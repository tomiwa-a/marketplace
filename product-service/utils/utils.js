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
    req.headers["x-user-id"] || "923f3b2b-bd70-4390-b29a-e8ac2acf9883";
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
