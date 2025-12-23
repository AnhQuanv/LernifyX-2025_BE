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

  private connectedClients: Map<string, Socket> = new Map();
  private socketToTaskMap: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    const taskId = this.socketToTaskMap.get(socketId);

    if (taskId) {
      this.socketToTaskMap.delete(socketId);
      console.log(
        `[WS] Socket ${socketId} ngắt, tạm giữ Task ${taskId} chờ reconnect.`,
      );

      setTimeout(() => {
        const currentSocket = this.connectedClients.get(taskId);
        if (currentSocket && currentSocket.id === socketId) {
          this.connectedClients.delete(taskId);
          console.log(`[WS] Đã dọn dẹp Task ${taskId} sau thời gian chờ.`);
        }
      }, 60000);
    }
  }

  @SubscribeMessage('register_upload')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() taskId: string,
  ) {
    if (!client || !client.id) {
      console.error('Lỗi: Đối tượng client (socket) không tồn tại.');
      return;
    }
    this.connectedClients.set(taskId, client);
    this.socketToTaskMap.set(client.id, taskId);

    console.log(`[WS] Đã đăng ký taskId ${taskId} cho socket ${client.id}`);
  }

  sendComplete(taskId: string, data: any) {
    const now = new Date().toLocaleString('vi-VN');
    const clientSocket = this.connectedClients.get(taskId);
    if (!clientSocket) {
      console.error(
        `[${now}] [WS-LỖI] Socket cho Task ID ${taskId} KHÔNG ĐƯỢC TÌM THẤY! (Socket đã ngắt)`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.server.emit('upload_complete', { taskId, data });
      console.log(
        `[${now}] [WS-FALLBACK] Đã gửi broadcast cho Task ID: ${taskId}.`,
      );
    } else {
      console.log(
        `[${now}] [WS-THÀNH CÔNG] Socket cho Task ID ${taskId} được tìm thấy.`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      clientSocket.emit('upload_complete', { taskId, data });
      this.socketToTaskMap.delete(clientSocket.id);
      this.connectedClients.delete(taskId);
    }
  }
  sendError(taskId: string, message: string) {
    const clientSocket = this.connectedClients.get(taskId);
    if (clientSocket) {
      clientSocket.emit('upload_error', { taskId, message });
      this.socketToTaskMap.delete(clientSocket.id);
      this.connectedClients.delete(taskId);
    }
  }
}
