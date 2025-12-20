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
    const disconnectedTaskId = this.socketToTaskMap.get(socketId);

    if (disconnectedTaskId) {
      this.connectedClients.delete(disconnectedTaskId);
      this.socketToTaskMap.delete(socketId);
      console.log(
        `[WS] Socket ${socketId} (Task ID: ${disconnectedTaskId}) đã bị xóa khỏi Map.`,
      );
    } else {
      console.log(
        `[WS] Client ${socketId} ngắt kết nối, không tìm thấy Task ID đăng ký.`,
      );
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
    this.connectedClients.set(taskId, client); // Lưu vào Map ngược (Socket ID -> Task ID)
    this.socketToTaskMap.set(client.id, taskId);

    console.log(`[WS] Đã đăng ký taskId ${taskId} cho socket ${client.id}`);
  }

  sendComplete(taskId: string, data: any) {
    const clientSocket = this.connectedClients.get(taskId);
    if (!clientSocket) {
      console.error(
        `[WS-LỖI] Socket cho Task ID ${taskId} KHÔNG ĐƯỢC TÌM THẤY! (Socket đã ngắt)`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.server.emit('upload_complete', { taskId, data });
      console.log(`[WS-FALLBACK] Đã gửi broadcast cho Task ID: ${taskId}.`);
    } else {
      console.log(
        `[WS-THÀNH CÔNG] Socket cho Task ID ${taskId} được tìm thấy.`,
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
