
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./proto/user.proto', {});
const userPackage = grpc.loadPackageDefinition(packageDefinition);


const server = new grpc.Server();

server.addService(userPackage.UserService.service, {
  GetUser: getUser,
  GetMultipleUsers: getMultipleUsers,
  GetUsers: getUsers,
})

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on port 50051');
  server.start()
})


 function getUser(){

 }

 function getMultipleUsers(){
  
 }

 function getUsers(){
  
 }