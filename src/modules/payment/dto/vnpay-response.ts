export interface VNPayQuery {
  vnp_TxnRef: string;
  vnp_TransactionNo: string; // Mã giao dịch VNPay
  vnp_Amount: string; // Số tiền
  vnp_ResponseCode: string; // 00 = thành công
  vnp_OrderInfo?: string; // Thông tin đơn hàng
  vnp_BankCode?: string; // Mã ngân hàng
  vnp_PayDate?: string; // Ngày thanh toán
  vnp_TmnCode?: string; // Mã website trên VNPay
  vnp_SecureHash?: string; // Checksum
  vnp_BankTranNo?: string; // Mã giao dịch ngân hàng
  vnp_CardType?: string; // Loại thẻ
  [key: string]: string | undefined;
}

export interface MoMoCreateResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  deeplink: string;
  qrCodeUrl?: string;
}

export interface MoMoReturnQuery {
  orderId: string;
  resultCode: string;
  transId?: string;
  message?: string;
  [key: string]: string | undefined;
}

export const MoMoResponseMessages: Record<string, string> = {
  '0': 'Thành công',
  '10': 'Hệ thống đang được bảo trì',
  '11': 'Truy cập bị từ chối',
  '12': 'Phiên bản API không được hỗ trợ',
  '13': 'Xác thực doanh nghiệp thất bại',
  '20': 'Yêu cầu sai định dạng',
  '21': 'Số tiền giao dịch không hợp lệ',
  '22': 'Số tiền giao dịch không hợp lệ',
  '40': 'RequestId bị trùng',
  '41': 'OrderId bị trùng',
  '42': 'OrderId không hợp lệ hoặc không được tìm thấy',
  '43': 'Yêu cầu bị từ chối do xung đột giao dịch',
  '45': 'Trùng ItemId',
  '47': 'Yêu cầu bị từ chối vì thông tin không hợp lệ',
  '98': 'QR Code tạo không thành công',
  '99': 'Lỗi không xác định',
  '1000': 'Giao dịch chờ xác nhận từ người dùng',
  '1001': 'Tài khoản người dùng không đủ tiền',
  '1002': 'Giao dịch bị từ chối do nhà phát hành',
  '1003': 'Giao dịch bị hủy',
  '1004': 'Thanh toán vượt hạn mức người dùng',
  '1005': 'URL hoặc QR code hết hạn',
  '1006': 'Người dùng từ chối xác nhận thanh toán',
  '1007': 'Tài khoản không tồn tại hoặc ngưng hoạt động',
  '1017': 'Giao dịch bị hủy bởi đối tác',
  '1026': 'Giao dịch bị hạn chế theo khuyến mãi',
  '1080': 'Hoàn tiền thất bại',
  '1081': 'Hoàn tiền bị từ chối',
  '1088': 'Hoàn tiền không được hỗ trợ',
  '2019': 'OrderGroupId không hợp lệ',
  '4001': 'Tài khoản người dùng bị hạn chế',
  '4002': 'Tài khoản người dùng chưa xác thực với C06',
  '4100': 'Người dùng chưa đăng nhập thành công',
  '7000': 'Giao dịch đang được xử lý',
  '7002': 'Giao dịch đang xử lý bởi nhà cung cấp',
  '9000': 'Giao dịch đã xác nhận thành công',
};
