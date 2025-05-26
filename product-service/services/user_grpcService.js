const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
require("dotenv").config();


const PROTO_PATH = "./proto/user.proto";


class userGrpcService {
    constructor(logger) {
        this.logger = logger;
        this.client = undefined;
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
        this.client = new protoDescriptor.user.UserService(
            process.env.USER_SERVICE_GRPC_URL || "localhost:50051",
            grpc.credentials.createInsecure()
        );

    }

    async getUser(userId) {
        return new Promise((resolve, reject) => {
            this.client.GetUser({ user_id: userId }, (error, response) => {
                if (error) {
                    this.logger.error(error);
                    // reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    async getMultipleUsers(userIds) {
        return new Promise((resolve, reject) => {
            this.client.GetMultipleUsers({ user_ids: userIds }, (error, response) => {
                if (error) {
                    this.logger.error(error);
                    // reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }
}

module.exports = userGrpcService;