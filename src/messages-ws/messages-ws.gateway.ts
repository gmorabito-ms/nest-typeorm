import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/strategies/interfaces/jwt-payload';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsservice: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string
    let payload:JwtPayload
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsservice.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect()
      return
    }


    // console.log(payload);
    this.wss.emit('clients-updated', this.messagesWsservice.getConnectedClients())
  }

  handleDisconnect(client: Socket) {
    this.messagesWsservice.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesWsservice.getConnectedClients())
  }

  @SubscribeMessage('message-from-client') // waits for the exact event that we want to hear
  onMessageFromClient(client:Socket, payload:NewMessageDto){
    // only to client
    // client.emit('message-from-server', ({
    //   fullName:'soy yo',
    //   message: payload.message || 'no message'
    // }))

    // emit everyone, unless the main client
    // client.broadcast.emit('message-from-server', ({
    //   fullName:'soy yo',
    //   message: payload.message || 'no message'
    // })) 

    // to everyone
    this.wss.emit('message-from-server', ({
        fullName:'soy yo',
        message: payload.message || 'no message'
      })) 
    
  }
}
