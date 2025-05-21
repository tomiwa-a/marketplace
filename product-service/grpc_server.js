const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./proto/user.proto";

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const userProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
let users = [
  { name: "Tomiwa amole", email: "tomiwamole@gmail.com" },
  { name: "debss ", email: "debsy@gmail.com" },
];

server.addService(userProto.UserService.service, {
  GetUsers: (_, callback) => {
    callback(null, { users: users });
  },
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
);
