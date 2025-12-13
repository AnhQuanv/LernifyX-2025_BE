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
    origin: '*', // Cho phép kết nối từ mọi nguồn (cần thay đổi trong môi trường production)
  },
})
export class ProgressGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map để lưu trữ kết nối: key là taskId (string), value là Socket object
  private connectedClients: Map<string, Socket> = new Map();

  // Xử lý khi Client kết nối (không cần logic đặc biệt, chỉ là log)
  handleConnection(client: Socket) {
    console.log(`Client kết nối: ${client.id}`);
  }

  // Xử lý khi Client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log(`Client ngắt kết nối: ${client.id}`);

    // Xóa kết nối khỏi map khi client ngắt kết nối
    this.connectedClients.forEach((socket, taskId) => {
      if (socket.id === client.id) {
        this.connectedClients.delete(taskId);
      }
    });
  }

  // 🛑 Lắng nghe sự kiện 'register_upload' từ FE
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
    console.log(`Đã đăng ký taskId ${taskId} cho socket ${client.id}`);
  }

  // Phương thức được gọi từ Service để gửi tiến trình
  sendProgress(taskId: string, progress: number) {
    const clientSocket = this.connectedClients.get(taskId);
    if (clientSocket) {
      // Gửi sự kiện 'upload_progress' về client
      clientSocket.emit('upload_progress', { taskId, progress });
    }
  }

  // Phương thức gửi tín hiệu hoàn tất (sau khi lưu DB)
  sendComplete(taskId: string, data: any) {
    const clientSocket = this.connectedClients.get(taskId);
    if (clientSocket) {
      clientSocket.emit('upload_complete', { taskId, data });
      this.connectedClients.delete(taskId);
    }
  }

  // Phương thức gửi lỗi
  sendError(taskId: string, message: string) {
    const clientSocket = this.connectedClients.get(taskId);
    if (clientSocket) {
      clientSocket.emit('upload_error', { taskId, message });
      this.connectedClients.delete(taskId);
    }
  }
}
