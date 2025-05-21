const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./proto/user.proto";

class UserService {
    constructor() {
        this.client;
        this.initializeclient();
    }

    initializeclient() {
        const options = {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        };

        const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

        // Initialize UserService client
        this.client.userService = new protoDescriptor.UserService(
            "localhost:50051",
            grpc.credentials.createInsecure()
        );

    }

    async getUser(userId) {
        return new Promise((resolve, reject) => {
            this.client.userService.GetUser({ userid: userId }, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    async getMultipleUsers(userIds) {
        return new Promise((resolve, reject) => {
            this.client.userService.GetMultipleUsers({ userid: userIds }, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }
}

module.exports = UserService;