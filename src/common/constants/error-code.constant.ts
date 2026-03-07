export const ErrorCode = {
  // Auth
  INVALID_CREDENTIALS:       { code: 'AUTH_001', message: 'Email hoặc mật khẩu không đúng' },
  UNAUTHORIZED:              { code: 'AUTH_002', message: 'Bạn chưa đăng nhập' },
  FORBIDDEN:                 { code: 'AUTH_003', message: 'Bạn không có quyền thực hiện thao tác này' },
  TOKEN_EXPIRED:             { code: 'AUTH_004', message: 'Phiên đăng nhập đã hết hạn' },
  TOKEN_INVALID:             { code: 'AUTH_005', message: 'Token không hợp lệ' },

  // User
  USER_NOT_FOUND:            { code: 'USER_001', message: 'Không tìm thấy người dùng' },
  EMAIL_ALREADY_EXISTS:      { code: 'USER_002', message: 'Email đã được sử dụng' },
  USER_INACTIVE:             { code: 'USER_003', message: 'Tài khoản đã bị vô hiệu hóa' },

  // Product
  PRODUCT_NOT_FOUND:         { code: 'PRODUCT_001', message: 'Không tìm thấy sản phẩm' },
  PRODUCT_OUT_OF_STOCK:      { code: 'PRODUCT_002', message: 'Sản phẩm đã hết hàng' },
  PRODUCT_INACTIVE:          { code: 'PRODUCT_003', message: 'Sản phẩm không còn kinh doanh' },
  INSUFFICIENT_STOCK:        { code: 'PRODUCT_004', message: 'Số lượng tồn kho không đủ' },

  // Category 
  CATEGORY_NOT_FOUND:        { code: 'CATEGORY_001', message: 'Không tìm thấy danh mục' },
  CATEGORY_HAS_PRODUCTS:     { code: 'CATEGORY_002', message: 'Danh mục đang chứa sản phẩm, không thể xóa' },

  // Order
  ORDER_NOT_FOUND:           { code: 'ORDER_001', message: 'Không tìm thấy đơn hàng' },
  ORDER_CANNOT_CANCEL:       { code: 'ORDER_002', message: 'Đơn hàng không thể hủy ở trạng thái này' },
  ORDER_ALREADY_PAID:        { code: 'ORDER_003', message: 'Đơn hàng đã được thanh toán' },

  // Cart
  CART_ITEM_NOT_FOUND:       { code: 'CART_001', message: 'Không tìm thấy sản phẩm trong giỏ hàng' },
  CART_EMPTY:                { code: 'CART_002', message: 'Giỏ hàng đang trống' },

  // Reviews
  REVIEW_NOT_FOUND:          { code: 'REVIEW_001', message: 'Không tìm thấy đánh giá' },
  REVIEW_ALREADY_EXISTS:     { code: 'REVIEW_002', message: 'Bạn đã đánh giá sản phẩm này rồi' },
  REVIEW_NOT_PURCHASED:      { code: 'REVIEW_003', message: 'Bạn cần mua sản phẩm trước khi đánh giá' },

  // Password Reset
  OTP_INVALID:               { code: 'PWD_001', message: 'Mã OTP không hợp lệ' },
  OTP_EXPIRED:               { code: 'PWD_002', message: 'Mã OTP đã hết hạn' },

  // Validation
  VALIDATION_ERROR:          { code: 'VAL_001', message: 'Dữ liệu đầu vào không hợp lệ' },

  // System
  INTERNAL_SERVER_ERROR:     { code: 'SYS_001', message: 'Lỗi hệ thống, vui lòng thử lại sau' },
  NOT_FOUND:                 { code: 'SYS_002', message: 'Không tìm thấy tài nguyên yêu cầu' },
} as const;


export type ErrorCodeKey = keyof typeof ErrorCode;
