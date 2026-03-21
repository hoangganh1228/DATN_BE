import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockProduct: Partial<Product> = {
  id:        1,
  name:      'Men T-shirt',
  price:     150000,
  salePrice: 120000,
};

const mockCartItem: Partial<Cart> = {
  id:        1,
  userId:    1,
  productId: 1,
  quantity:  2,
  product:   mockProduct as Product,
};

const mockCartSummary = {
  items:      [mockCartItem],
  totalItems: 1,
  totalQty:   2,
  totalPrice: 240000,
};

const mockReq = { user: { id: 1 } };

// ── Mock service ───────────────────────────────────────────────────────────
const mockCartService = {
  getCart:        jest.fn(),
  addToCart:      jest.fn(),
  updateQuantity: jest.fn(),
  removeItem:     jest.fn(),
  clearCart:      jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('CartController', () => {
  let controller: CartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [{ provide: CartsService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartsController>(CartsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── getCart ──────────────────────────────────────────────────────────────
  describe('getCart', () => {
    it('should call service.getCart with userId from JWT', async () => {
      mockCartService.getCart.mockResolvedValue(mockCartSummary);

      const result = await controller.getCart(mockReq);

      expect(mockCartService.getCart).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCartSummary);
    });

    it('should return an empty cart', async () => {
      const emptySummary = { items: [], totalItems: 0, totalQty: 0, totalPrice: 0 };
      mockCartService.getCart.mockResolvedValue(emptySummary);

      const result = await controller.getCart(mockReq);

      expect(result.totalItems).toBe(0);
    });
  });

  // ── addToCart ────────────────────────────────────────────────────────────
  describe('addToCart', () => {
    it('should call service.addToCart with userId and dto', async () => {
      const dto = { productId: 1, quantity: 2 };
      mockCartService.addToCart.mockResolvedValue(mockCartItem);

      const result = await controller.addToCart(mockReq, dto);

      expect(mockCartService.addToCart).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockCartItem);
    });
  });

  // ── updateQuantity ───────────────────────────────────────────────────────
  describe('updateQuantity', () => {
    it('should call service.updateQuantity with cartId, userId, and dto', async () => {
      const dto = { quantity: 5 };
      mockCartService.updateQuantity.mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await controller.updateQuantity(1, mockReq, dto);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 1, dto);
      expect(result.quantity).toBe(5);
    });
  });

  // ── removeItem ───────────────────────────────────────────────────────────
  describe('removeItem', () => {
    it('should call service.removeItem with cartId and userId', async () => {
      mockCartService.removeItem.mockResolvedValue(undefined);

      await controller.removeItem(1, mockReq);

      expect(mockCartService.removeItem).toHaveBeenCalledWith(1, 1);
    });
  });

  // ── clearCart ────────────────────────────────────────────────────────────
  describe('clearCart', () => {
    it('should call service.clearCart with userId', async () => {
      mockCartService.clearCart.mockResolvedValue(undefined);

      await controller.clearCart(mockReq);

      expect(mockCartService.clearCart).toHaveBeenCalledWith(1);
    });
  });
});