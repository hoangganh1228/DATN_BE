import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController, AdminOrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/orders.entity';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockOrder: Partial<Order> = {
  id:              1,
  userId:          1,
  totalAmount:     540000,
  status:          'pending',
  shippingAddress: '123 ABC Street, Hanoi',
  paymentMethod:   'cod',
  paymentStatus:   'unpaid',
  items:           [],
};

const mockPaginatedResult = {
  data: [mockOrder], total: 1, page: 1, limit: 10, totalPages: 1,
};

const mockReq = { user: { id: 1 } };

// ── Mock service ───────────────────────────────────────────────────────────
const mockOrdersService = {
  getMyOrders:         jest.fn(),
  getMyOrderById:      jest.fn(),
  getAllOrders:         jest.fn(),
  getOrderById:        jest.fn(),
  checkout:            jest.fn(),
  createOrder:         jest.fn(),
  updateOrderStatus:   jest.fn(),
  updatePaymentStatus: jest.fn(),
  cancelOrder:         jest.fn(),
};

// ════════════════════════════════════════════════
//  OrdersController (customer)
// ════════════════════════════════════════════════
describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyOrders', () => {
    it('should call service.getMyOrders with userId from JWT and query', async () => {
      const query = { page: 1, limit: 10 };
      mockOrdersService.getMyOrders.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getMyOrders(mockReq, query);

      expect(mockOrdersService.getMyOrders).toHaveBeenCalledWith(1, query);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getMyOrderById', () => {
    it('should call service.getMyOrderById with orderId and userId', async () => {
      mockOrdersService.getMyOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getMyOrderById(1, mockReq);

      expect(mockOrdersService.getMyOrderById).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('checkout', () => {
    it('should call service.checkout with userId and dto', async () => {
      const dto = { shippingAddress: '123 ABC Street', paymentMethod: 'cod' };
      mockOrdersService.checkout.mockResolvedValue(mockOrder);

      const result = await controller.checkout(mockReq, dto);

      expect(mockOrdersService.checkout).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('createOrder', () => {
    it('should call service.createOrder with userId and dto', async () => {
      const dto = {
        items:           [{ productId: 1, quantity: 2 }],
        shippingAddress: '123 ABC Street',
      };
      mockOrdersService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(mockReq, dto);

      expect(mockOrdersService.createOrder).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should call service.cancelOrder with orderId and userId', async () => {
      mockOrdersService.cancelOrder.mockResolvedValue({ ...mockOrder, status: 'cancelled' });

      const result = await controller.cancelOrder(1, mockReq);

      expect(mockOrdersService.cancelOrder).toHaveBeenCalledWith(1, 1);
      expect(result.status).toBe('cancelled');
    });
  });
});

// ════════════════════════════════════════════════
//  AdminOrdersController
// ════════════════════════════════════════════════
describe('AdminOrdersController', () => {
  let controller: AdminOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<AdminOrdersController>(AdminOrdersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should call service.getAllOrders with query', async () => {
      mockOrdersService.getAllOrders.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllOrders({ status: 'pending' });

      expect(mockOrdersService.getAllOrders).toHaveBeenCalledWith({ status: 'pending' });
      expect(result.total).toBe(1);
    });
  });

  describe('getOrderById', () => {
    it('should call service.getOrderById with the correct id', async () => {
      mockOrdersService.getOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById(1);

      expect(mockOrdersService.getOrderById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateOrderStatus with the correct id and dto', async () => {
      mockOrdersService.updateOrderStatus.mockResolvedValue({
        ...mockOrder, status: 'confirmed',
      });

      const result = await controller.updateStatus(1, { status: 'confirmed' });

      expect(mockOrdersService.updateOrderStatus).toHaveBeenCalledWith(1, { status: 'confirmed' });
      expect(result.status).toBe('confirmed');
    });
  });

  describe('updatePayment', () => {
    it('should call service.updatePaymentStatus with the correct id and dto', async () => {
      mockOrdersService.updatePaymentStatus.mockResolvedValue({
        ...mockOrder, paymentStatus: 'paid',
      });

      const result = await controller.updatePayment(1, { paymentStatus: 'paid' });

      expect(mockOrdersService.updatePaymentStatus).toHaveBeenCalledWith(1, { paymentStatus: 'paid' });
      expect(result.paymentStatus).toBe('paid');
    });
  });
});