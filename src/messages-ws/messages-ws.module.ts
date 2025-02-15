import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [],
  imports:[AuthModule],
  providers: [MessagesWsService, MessagesWsGateway],
})
export class MessagesWsModule {}
