import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrderRepository } from './repositories/orders.repositories';
import { CartRepository } from '../carts/repositories/cart.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { Order } from './entities/orders.entity';
import { Cart } from '../carts/entities/cart.entity';
import { Product } from '../products/entities/product.entity';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockProduct: Partial<Product> = {
  id:            1,
  name:          'Men T-shirt',
  price:         150000,
  salePrice:     120000,
  stockQuantity: 50,
  status:        'active',
};

const mockProduct2: Partial<Product> = {
  id:            2,
  name:          'Jeans',
  price:         300000,
  salePrice:     null,
  stockQuantity: 20,
  status:        'active',
};

const mockCartItem: Partial<Cart> = {
  id:        1,
  userId:    1,
  productId: 1,
  quantity:  2,
  product:   mockProduct as Product,
};

const mockCartItem2: Partial<Cart> = {
  id:        2,
  userId:    1,
  productId: 2,
  quantity:  1,
  product:   mockProduct2 as Product,
};

const mockOrderItem = {
  id:          1,
  orderId:     1,
  productId:   1,
  productName: 'Men T-shirt',
  unitPrice:   120000,
  quantity:    2,
  subtotal:    240000,
};

const mockOrder: Partial<Order> = {
  id:              1,
  userId:          1,
  totalAmount:     540000,
  status:          'pending',
  shippingAddress: '123 ABC Street, Hanoi',
  paymentMethod:   'cod',
  paymentStatus:   'unpaid',
  note:            null,
  items:           [mockOrderItem as any],
  createdAt:       new Date('2024-01-01'),
  updatedAt:       new Date('2024-01-01'),
};

// ── Manager mock (used for transaction) ───────────────────────────────────
const mockManager = {
  create: jest.fn(),
  save:   jest.fn(),
};

// ── Mock repositories ──────────────────────────────────────────────────────
const mockOrderRepo = {
  findById:          jest.fn(),
  findByUserId:      jest.fn(),
  findAll:           jest.fn(),
  findByIdAndUserId: jest.fn(),
  save:              jest.fn(),
};

const mockCartRepo = {
  findByUserId: jest.fn(),
  clearCart:    jest.fn(),
};

const mockProductRepo = {
  findById: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrderRepository,   useValue: mockOrderRepo },
        { provide: CartRepository,    useValue: mockCartRepo },
        { provide: ProductRepository, useValue: mockProductRepo },
        { provide: DataSource,        useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ════════════════════════════════════════════════
  //  getMyOrders
  // ════════════════════════════════════════════════
  describe('getMyOrders', () => {
    it('should return the list of orders for the user', async () => {
      const paginatedResult = {
        data: [mockOrder], total: 1, page: 1, limit: 10, totalPages: 1,
      };
      mockOrderRepo.findByUserId.mockResolvedValue(paginatedResult);

      const result = await service.getMyOrders(1, { page: 1, limit: 10 });

      expect(mockOrderRepo.findByUserId).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });

    it('should return an empty list when there are no orders', async () => {
      mockOrderRepo.findByUserId.mockResolvedValue({
        data: [], total: 0, page: 1, limit: 10, totalPages: 0,
      });

      const result = await service.getMyOrders(1, {});
      expect(result.total).toBe(0);
    });
  });

  // ════════════════════════════════════════════════
  //  getMyOrderById
  // ════════════════════════════════════════════════
  describe('getMyOrderById', () => {
    it('should return the order when it is found', async () => {
      mockOrderRepo.findByIdAndUserId.mockResolvedValue(mockOrder);

      const result = await service.getMyOrderById(1, 1);

      expect(mockOrderRepo.findByIdAndUserId).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockOrder);
    });

    it('should throw ORDER_NOT_FOUND when the order does not exist', async () => {
      mockOrderRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.getMyOrderById(999, 1)).rejects.toThrow(AppException);
      await expect(service.getMyOrderById(999, 1)).rejects.toMatchObject({
        errorCode: 'ORDER_001',
      });
    });

    it('should throw ORDER_NOT_FOUND when the order belongs to a different user', async () => {
      // findByIdAndUserId filters by both userId values, so it returns null
      mockOrderRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.getMyOrderById(1, 999)).rejects.toThrow(AppException);
    });
  });

  // ════════════════════════════════════════════════
  //  getOrderById (admin)
  // ════════════════════════════════════════════════
  describe('getOrderById', () => {
    it('should return the order when it is found', async () => {
      mockOrderRepo.findById.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(1);
      expect(result).toEqual(mockOrder);
    });

    it('should throw ORDER_NOT_FOUND when it is not found', async () => {
      mockOrderRepo.findById.mockResolvedValue(null);

      await expect(service.getOrderById(999)).rejects.toThrow(AppException);
    });
  });

  // ════════════════════════════════════════════════
  //  checkout
  // ════════════════════════════════════════════════
  describe('checkout', () => {
    const dto = {
      shippingAddress: '123 ABC Street, Hanoi',
      paymentMethod:   'cod',
    };

    it('should create an order successfully from the cart', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem, mockCartItem2]);
      mockProductRepo.findById
        .mockResolvedValueOnce({ ...mockProduct })
        .mockResolvedValueOnce({ ...mockProduct2 });
      mockManager.create.mockReturnValue({ ...mockOrder });
      mockManager.save.mockResolvedValue({ ...mockOrder });
      mockCartRepo.clearCart.mockResolvedValue(undefined);

      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      const result = await service.checkout(1, dto);

      expect(mockCartRepo.findByUserId).toHaveBeenCalledWith(1);
      expect(mockCartRepo.clearCart).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('should calculate totalAmount correctly: salePrice has priority over price', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem]); // qty=2, salePrice=120000
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct });

      let capturedOrder: any;
      mockManager.create.mockImplementation((_, data) => {
        capturedOrder = data;
        return data;
      });
      mockManager.save.mockResolvedValue({ ...mockOrder, totalAmount: 240000 });
      mockCartRepo.clearCart.mockResolvedValue(undefined);
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await service.checkout(1, dto);

      // 120000 * 2 = 240000
      expect(capturedOrder.totalAmount).toBe(240000);
    });

    it('should reduce stock quantity after checkout', async () => {
      const productCopy = { ...mockProduct, stockQuantity: 50 };
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem]); // qty=2
      mockProductRepo.findById.mockResolvedValue(productCopy);
      mockManager.create.mockReturnValue(mockOrder);
      mockManager.save.mockResolvedValue(mockOrder);
      mockCartRepo.clearCart.mockResolvedValue(undefined);
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await service.checkout(1, dto);

      // stockQuantity 50 - 2 = 48
      expect(productCopy.stockQuantity).toBe(48);
    });

    it('should change product status to out_of_stock when stock runs out', async () => {
      const productCopy = { ...mockProduct, stockQuantity: 2 };
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem]); // qty=2
      mockProductRepo.findById.mockResolvedValue(productCopy);
      mockManager.create.mockReturnValue(mockOrder);
      mockManager.save.mockResolvedValue(mockOrder);
      mockCartRepo.clearCart.mockResolvedValue(undefined);
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await service.checkout(1, dto);

      expect(productCopy.stockQuantity).toBe(0);
      expect(productCopy.status).toBe('out_of_stock');
    });

    it('should throw CART_EMPTY when the cart is empty', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([]);

      await expect(service.checkout(1, dto)).rejects.toThrow(AppException);
      await expect(service.checkout(1, dto)).rejects.toMatchObject({
        errorCode: 'CART_002',
      });
    });

    it('should throw PRODUCT_INACTIVE when a product in the cart is inactive/hidden', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem]);
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, status: 'inactive' });
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await expect(service.checkout(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_003',
      });
    });

    it('should throw INSUFFICIENT_STOCK when stock is insufficient', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem]); // qty=2
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 1 });
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await expect(service.checkout(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_004',
      });
    });
  });

  // ════════════════════════════════════════════════
  //  createOrder (direct)
  // ════════════════════════════════════════════════
  describe('createOrder', () => {
    const dto = {
      items:           [{ productId: 1, quantity: 2 }],
      shippingAddress: '123 ABC Street',
      paymentMethod:   'cod',
    };

    it('should create an order directly successfully', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct });
      mockManager.create.mockReturnValue(mockOrder);
      mockManager.save.mockResolvedValue(mockOrder);
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      const result = await service.createOrder(1, dto);

      expect(result).toEqual(mockOrder);
    });

    it('should throw PRODUCT_NOT_FOUND when the product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await expect(service.createOrder(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_001',
      });
    });

    it('should throw PRODUCT_INACTIVE when the product is inactive', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, status: 'inactive' });
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await expect(service.createOrder(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_003',
      });
    });

    it('should throw INSUFFICIENT_STOCK when stock is insufficient', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 1 });
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await expect(service.createOrder(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_004',
      });
    });
  });

  // ════════════════════════════════════════════════
  //  updateOrderStatus
  // ════════════════════════════════════════════════
  describe('updateOrderStatus', () => {
    it('should transition status: pending → confirmed', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'pending' });
      mockOrderRepo.save.mockResolvedValue({ ...mockOrder, status: 'confirmed' });

      const result = await service.updateOrderStatus(1, { status: 'confirmed' });
      expect(result.status).toBe('confirmed');
    });

    it('should transition status: confirmed → shipping', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'confirmed' });
      mockOrderRepo.save.mockResolvedValue({ ...mockOrder, status: 'shipping' });

      const result = await service.updateOrderStatus(1, { status: 'shipping' });
      expect(result.status).toBe('shipping');
    });

    it('should transition status: shipping → completed', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'shipping' });
      mockOrderRepo.save.mockResolvedValue({ ...mockOrder, status: 'completed' });

      const result = await service.updateOrderStatus(1, { status: 'completed' });
      expect(result.status).toBe('completed');
    });

    it('should throw when transitioning to an invalid status: shipping → pending', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'shipping' });

      await expect(
        service.updateOrderStatus(1, { status: 'pending' }),
      ).rejects.toThrow(AppException);
      await expect(
        service.updateOrderStatus(1, { status: 'pending' }),
      ).rejects.toMatchObject({ errorCode: 'ORDER_002' });
    });

    it('should throw when the order is already completed', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'completed' });

      await expect(
        service.updateOrderStatus(1, { status: 'cancelled' }),
      ).rejects.toThrow(AppException);
    });

    it('should throw when the order is already cancelled', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'cancelled' });

      await expect(
        service.updateOrderStatus(1, { status: 'confirmed' }),
      ).rejects.toThrow(AppException);
    });
  });

  // ════════════════════════════════════════════════
  //  updatePaymentStatus
  // ════════════════════════════════════════════════
  describe('updatePaymentStatus', () => {
    it('should update payment status successfully: unpaid → paid', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'confirmed', paymentStatus: 'unpaid' });
      mockOrderRepo.save.mockResolvedValue({ ...mockOrder, paymentStatus: 'paid' });

      const result = await service.updatePaymentStatus(1, { paymentStatus: 'paid' });
      expect(result.paymentStatus).toBe('paid');
    });

    it('should throw when the order has been cancelled', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'cancelled' });

      await expect(
        service.updatePaymentStatus(1, { paymentStatus: 'paid' }),
      ).rejects.toMatchObject({ errorCode: 'ORDER_002' });
    });

    it('should throw ORDER_ALREADY_PAID when it has already been paid', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status:        'confirmed',
        paymentStatus: 'paid',
      });

      await expect(
        service.updatePaymentStatus(1, { paymentStatus: 'paid' }),
      ).rejects.toMatchObject({ errorCode: 'ORDER_003' });
    });
  });

  // ════════════════════════════════════════════════
  //  cancelOrder
  // ════════════════════════════════════════════════
  describe('cancelOrder', () => {
    it('should cancel a pending order successfully and restore stock quantity', async () => {
      const productCopy = { ...mockProduct, stockQuantity: 48, status: 'active' };
      mockOrderRepo.findByIdAndUserId.mockResolvedValue({
        ...mockOrder,
        status: 'pending',
        items:  [mockOrderItem],
      });
      mockProductRepo.findById.mockResolvedValue(productCopy);
      mockManager.save.mockResolvedValue({ ...mockOrder, status: 'cancelled' });
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      const result = await service.cancelOrder(1, 1);

      // Restored stock quantity: 48 + 2 = 50
      expect(productCopy.stockQuantity).toBe(50);
      expect(result.status).toBe('cancelled');
    });

    it('should set the product status back to active when restoring stock', async () => {
      const productCopy = { ...mockProduct, stockQuantity: 0, status: 'out_of_stock' };
      mockOrderRepo.findByIdAndUserId.mockResolvedValue({
        ...mockOrder,
        status: 'pending',
        items:  [mockOrderItem],
      });
      mockProductRepo.findById.mockResolvedValue(productCopy);
      mockManager.save.mockResolvedValue({ ...mockOrder, status: 'cancelled' });
      mockDataSource.transaction.mockImplementation(async (cb) => cb(mockManager));

      await service.cancelOrder(1, 1);

      expect(productCopy.status).toBe('active');
    });

    it('should throw ORDER_CANNOT_CANCEL when the order is currently shipping', async () => {
      mockOrderRepo.findByIdAndUserId.mockResolvedValue({
        ...mockOrder,
        status: 'shipping',
      });

      await expect(service.cancelOrder(1, 1)).rejects.toMatchObject({
        errorCode: 'ORDER_002',
      });
    });

    it('should throw ORDER_CANNOT_CANCEL when the order is already completed', async () => {
      mockOrderRepo.findByIdAndUserId.mockResolvedValue({
        ...mockOrder,
        status: 'completed',
      });

      await expect(service.cancelOrder(1, 1)).rejects.toThrow(AppException);
    });

    it('should throw ORDER_NOT_FOUND when the order does not belong to the user', async () => {
      mockOrderRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.cancelOrder(1, 999)).rejects.toMatchObject({
        errorCode: 'ORDER_001',
      });
    });
  });
});