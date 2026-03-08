export const ErrorCode = {
  // Auth
  INVALID_CREDENTIALS:       { code: 'AUTH_001', message: 'Email or password is incorrect' },
  UNAUTHORIZED:              { code: 'AUTH_002', message: 'You are not logged in' },
  FORBIDDEN:                 { code: 'AUTH_003', message: 'You are not authorized to perform this action' },
  TOKEN_EXPIRED:             { code: 'AUTH_004', message: 'Session has expired' },
  TOKEN_INVALID:             { code: 'AUTH_005', message: 'Token is invalid' },

  // User
  USER_NOT_FOUND:            { code: 'USER_001', message: 'User not found' },
  EMAIL_ALREADY_EXISTS:      { code: 'USER_002', message: 'Email already exists' },
  USER_INACTIVE:             { code: 'USER_003', message: 'User is inactive' },

  // Product
  PRODUCT_NOT_FOUND:         { code: 'PRODUCT_001', message: 'Product not found' },
  PRODUCT_OUT_OF_STOCK:      { code: 'PRODUCT_002', message: 'Product is out of stock' },
  PRODUCT_INACTIVE:          { code: 'PRODUCT_003', message: 'Product is inactive' },
  INSUFFICIENT_STOCK:        { code: 'PRODUCT_004', message: 'Insufficient stock' },

  // Category 
  CATEGORY_NOT_FOUND:        { code: 'CATEGORY_001', message: 'Category not found' },
  CATEGORY_HAS_PRODUCTS:     { code: 'CATEGORY_002', message: 'Category has products, cannot be deleted' },

  // Order
  ORDER_NOT_FOUND:           { code: 'ORDER_001', message: 'Order not found' },
  ORDER_CANNOT_CANCEL:       { code: 'ORDER_002', message: 'Order cannot be cancelled in this state' },
  ORDER_ALREADY_PAID:        { code: 'ORDER_003', message: 'Order has already been paid' },

  // Cart
  CART_ITEM_NOT_FOUND:       { code: 'CART_001', message: 'Product not found in cart' },
  CART_EMPTY:                { code: 'CART_002', message: 'Cart is empty' },

  // Reviews
  REVIEW_NOT_FOUND:          { code: 'REVIEW_001', message: 'Review not found' },
  REVIEW_ALREADY_EXISTS:     { code: 'REVIEW_002', message: 'You have already reviewed this product' },
  REVIEW_NOT_PURCHASED:      { code: 'REVIEW_003', message: 'You need to purchase the product before reviewing' },

  // Password Reset
  OTP_INVALID:               { code: 'PWD_001', message: 'OTP is invalid' },
  OTP_EXPIRED:               { code: 'PWD_002', message: 'OTP has expired' },

  // Validation
  VALIDATION_ERROR:          { code: 'VAL_001', message: 'Invalid input data' },

  // System
  INTERNAL_SERVER_ERROR:     { code: 'SYS_001', message: 'System error, please try again later' },
  NOT_FOUND:                 { code: 'SYS_002', message: 'Resource not found' },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCode;
