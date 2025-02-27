import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagingService } from './messaging.service';

import {Server } from 'socket.io';

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

  @SubscribeMessage("newMessage")
  onNewMessage(@MessageBody() body:any){
    console.log(body)
  }
}
