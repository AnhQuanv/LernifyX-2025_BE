import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ProgressGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WS] Client kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client ngắt kết nối: ${client.id}`);
  }

  @SubscribeMessage('register_upload')
  async handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() taskId: string,
  ) {
    if (taskId) {
      // Dùng await để sửa lỗi ESLint và đảm bảo client vào room thành công
      await client.join(taskId);
      console.log(
        `[WS] Socket ${client.id} đã tham gia phòng (taskId): ${taskId}`,
      );
    }
  }

  sendComplete(taskId: string, data: any) {
    const now = new Date().toLocaleString('vi-VN');

    // Gửi tín hiệu đến tất cả các socket trong phòng taskId
    this.server.to(taskId).emit('upload_complete', { taskId, data });

    console.log(
      `[${now}] ✅ [WS-SUCCESS] Đã phát tín hiệu hoàn thành tới phòng: ${taskId}`,
    );
  }

  sendError(taskId: string, message: string) {
    this.server.to(taskId).emit('upload_error', { taskId, message });
  }
}
