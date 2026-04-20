import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
    namespace: '/notifications',
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('NotificationGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client bağlandı: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ayrıldı: ${client.id}`);
    }

    sendSystemAlert(message: any) {
        this.server.emit('system-alert', message);
    }
}