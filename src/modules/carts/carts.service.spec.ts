import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartRepository } from './repositories/cart.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockProduct: Partial<Product> = {
  id:            1,
  name:          'Men T-shirt',
  price:         150000,
  salePrice:     120000,
  stockQuantity: 50,
  status:        'active',
  imageUrl:      'https://s3.amazonaws.com/products/ao-thun.jpg',
};

const mockProductNoSale: Partial<Product> = {
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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCartItem2: Partial<Cart> = {
  id:        2,
  userId:    1,
  productId: 2,
  quantity:  1,
  product:   mockProductNoSale as Product,
};

// ── Mock repositories ──────────────────────────────────────────────────────
const mockCartRepo = {
  findByUserId:      jest.fn(),
  findCartItem:      jest.fn(),
  findCartItemById:  jest.fn(),
  countItems:        jest.fn(),
  clearCart:         jest.fn(),
  create:            jest.fn(),
  save:              jest.fn(),
  remove:            jest.fn(),
  delete:            jest.fn(),
};

const mockProductRepo = {
  findById: jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('CartService', () => {
  let service: CartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        { provide: CartRepository,   useValue: mockCartRepo },
        { provide: ProductRepository, useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ════════════════════════════════════════════════
  //  getCart
  // ════════════════════════════════════════════════
  describe('getCart', () => {
    it('should return a cart with the correct total calculated using salePrice', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem, mockCartItem2]);

      const result = await service.getCart(1);

      // item1: salePrice 120000 × 2 = 240000
      // item2: price 300000 × 1 = 300000
      // total = 540000
      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(2);
      expect(result.totalQty).toBe(3);       // 2 + 1
      expect(result.totalPrice).toBe(540000);
    });

    it('should return a cart with the correct total when there is no salePrice', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([mockCartItem2]);

      const result = await service.getCart(1);

      // price 300000 × 1 = 300000
      expect(result.totalPrice).toBe(300000);
    });

    it('should return an empty cart when there are no items', async () => {
      mockCartRepo.findByUserId.mockResolvedValue([]);

      const result = await service.getCart(1);

      expect(result.items).toHaveLength(0);
      expect(result.totalItems).toBe(0);
      expect(result.totalQty).toBe(0);
      expect(result.totalPrice).toBe(0);
    });
  });

  // ════════════════════════════════════════════════
  //  addToCart
  // ════════════════════════════════════════════════
  describe('addToCart', () => {
    const dto = { productId: 1, quantity: 2 };

    it('should add a new product to the cart successfully', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCartRepo.findCartItem.mockResolvedValue(null);   // not in the cart yet
      mockCartRepo.create.mockReturnValue(mockCartItem);
      mockCartRepo.save.mockResolvedValue(mockCartItem);

      const result = await service.addToCart(1, dto);

      expect(mockCartRepo.findCartItem).toHaveBeenCalledWith(1, 1);
      expect(mockCartRepo.create).toHaveBeenCalledWith({
        userId:    1,
        productId: 1,
        quantity:  2,
      });
      expect(result).toEqual(mockCartItem);
    });

    it('should accumulate quantity when the product already exists in the cart', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCartRepo.findCartItem.mockResolvedValue({ ...mockCartItem, quantity: 3 });
      mockCartRepo.save.mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await service.addToCart(1, { productId: 1, quantity: 2 });

      // 3 (existing) + 2 (new) = 5
      expect(mockCartRepo.create).not.toHaveBeenCalled();
      expect(result.quantity).toBe(5);
    });

    it('should throw PRODUCT_NOT_FOUND when the product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.addToCart(1, dto)).rejects.toThrow(AppException);
      await expect(service.addToCart(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_001',
      });
    });

    it('should throw PRODUCT_INACTIVE when the product is inactive', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, status: 'inactive' });

      await expect(service.addToCart(1, dto)).rejects.toThrow(AppException);
      await expect(service.addToCart(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_003',
      });
    });

    it('should throw PRODUCT_OUT_OF_STOCK when status is out_of_stock', async () => {
      mockProductRepo.findById.mockResolvedValue({
        ...mockProduct,
        status:        'out_of_stock',
        stockQuantity: 0,
      });

      await expect(service.addToCart(1, dto)).rejects.toThrow(AppException);
      await expect(service.addToCart(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_002',
      });
    });

    it('should throw PRODUCT_OUT_OF_STOCK when stockQuantity is 0 even if status is active', async () => {
      mockProductRepo.findById.mockResolvedValue({
        ...mockProduct,
        status:        'active',
        stockQuantity: 0,
      });

      await expect(service.addToCart(1, dto)).rejects.toThrow(AppException);
    });

    it('should throw INSUFFICIENT_STOCK when the new quantity exceeds stock', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 3 });
      mockCartRepo.findCartItem.mockResolvedValue(null);

      await expect(
        service.addToCart(1, { productId: 1, quantity: 10 }),
      ).rejects.toThrow(AppException);
      await expect(
        service.addToCart(1, { productId: 1, quantity: 10 }),
      ).rejects.toMatchObject({ errorCode: 'PRODUCT_004' });
    });

    it('should throw INSUFFICIENT_STOCK when the accumulated quantity exceeds stock', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 5 });
      mockCartRepo.findCartItem.mockResolvedValue({ ...mockCartItem, quantity: 4 });

      // 4 (existing) + 3 (new) = 7 > 5 (stock)
      await expect(
        service.addToCart(1, { productId: 1, quantity: 3 }),
      ).rejects.toMatchObject({ errorCode: 'PRODUCT_004' });
    });

    it('should allow adding exactly the available stock quantity', async () => {
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 5 });
      mockCartRepo.findCartItem.mockResolvedValue(null);
      mockCartRepo.create.mockReturnValue({ ...mockCartItem, quantity: 5 });
      mockCartRepo.save.mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await service.addToCart(1, { productId: 1, quantity: 5 });

      expect(result.quantity).toBe(5);
    });
  });

  // ════════════════════════════════════════════════
  //  updateQuantity
  // ════════════════════════════════════════════════
  describe('updateQuantity', () => {
    it('should update quantity successfully', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue({ ...mockCartItem, productId: 1 });
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCartRepo.save.mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await service.updateQuantity(1, 1, { quantity: 5 });

      expect(result.quantity).toBe(5);
    });

    it('should throw CART_ITEM_NOT_FOUND when the cart item does not exist', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue(null);

      await expect(
        service.updateQuantity(999, 1, { quantity: 2 }),
      ).rejects.toThrow(AppException);
      await expect(
        service.updateQuantity(999, 1, { quantity: 2 }),
      ).rejects.toMatchObject({ errorCode: 'CART_001' });
    });

    it('should throw CART_ITEM_NOT_FOUND when the item belongs to a different user', async () => {
      // findCartItemById filters by userId and returns null if it is not the same user
      mockCartRepo.findCartItemById.mockResolvedValue(null);

      await expect(
        service.updateQuantity(1, 999, { quantity: 2 }),
      ).rejects.toThrow(AppException);
    });

    it('should throw INSUFFICIENT_STOCK when the new quantity exceeds stock', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue({ ...mockCartItem, productId: 1 });
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 3 });

      await expect(
        service.updateQuantity(1, 1, { quantity: 10 }),
      ).rejects.toMatchObject({ errorCode: 'PRODUCT_004' });
    });

    it('should allow updating to exactly the available stock quantity', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue({ ...mockCartItem, productId: 1 });
      mockProductRepo.findById.mockResolvedValue({ ...mockProduct, stockQuantity: 10 });
      mockCartRepo.save.mockResolvedValue({ ...mockCartItem, quantity: 10 });

      const result = await service.updateQuantity(1, 1, { quantity: 10 });

      expect(result.quantity).toBe(10);
    });
  });

  // ════════════════════════════════════════════════
  //  removeItem
  // ════════════════════════════════════════════════
  describe('removeItem', () => {
    it('should remove an item from the cart successfully', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue(mockCartItem);
      mockCartRepo.remove.mockResolvedValue(undefined);

      await service.removeItem(1, 1);

      expect(mockCartRepo.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('should throw CART_ITEM_NOT_FOUND when the cart item does not exist', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue(null);

      await expect(service.removeItem(999, 1)).rejects.toThrow(AppException);
      await expect(service.removeItem(999, 1)).rejects.toMatchObject({
        errorCode: 'CART_001',
      });
    });

    it('should throw CART_ITEM_NOT_FOUND when trying to remove an item from another user', async () => {
      mockCartRepo.findCartItemById.mockResolvedValue(null);

      await expect(service.removeItem(1, 999)).rejects.toThrow(AppException);
    });
  });

  // ════════════════════════════════════════════════
  //  clearCart
  // ════════════════════════════════════════════════
  describe('clearCart', () => {
    it('should clear the entire cart successfully', async () => {
      mockCartRepo.countItems.mockResolvedValue(3);
      mockCartRepo.clearCart.mockResolvedValue(undefined);

      await service.clearCart(1);

      expect(mockCartRepo.countItems).toHaveBeenCalledWith(1);
      expect(mockCartRepo.clearCart).toHaveBeenCalledWith(1);
    });

    it('should throw CART_EMPTY when the cart is already empty', async () => {
      mockCartRepo.countItems.mockResolvedValue(0);

      await expect(service.clearCart(1)).rejects.toThrow(AppException);
      await expect(service.clearCart(1)).rejects.toMatchObject({
        errorCode: 'CART_002',
      });
      expect(mockCartRepo.clearCart).not.toHaveBeenCalled();
    });
  });
});