import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagingService } from './messaging.service';

import {Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MessagingGateway {
  constructor(private readonly messagingService: MessagingService) {}

  @WebSocketServer()
  server: Server

  onModuleInit(){
    this.server.on('connection', (socket)=>{
      console.log(socket.id)

      console.log("Connected!")
    })
  }

  @SubscribeMessage("message")
  onNewMessage(@MessageBody() body:any){

    //check HEADER FOR X-USER for the person logged in. 
    //check if the conversation exists.
    //if it does join a room?
    console.log(body)
  }
}
