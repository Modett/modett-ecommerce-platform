import { CartRepository } from "../../domain/repositories/cart.repository";
import { ReservationRepository } from "../../domain/repositories/reservation.repository";
import { ShoppingCart, CreateShoppingCartData } from "../../domain/entities/shopping-cart.entity";
import { CartItem, CreateCartItemData } from "../../domain/entities/cart-item.entity";
import { CartId } from "../../domain/value-objects/cart-id.vo";
import { UserId } from "../../../user-management/domain/value-objects/user-id.vo";
import { GuestToken } from "../../domain/value-objects/guest-token.vo";
import { Currency } from "../../domain/value-objects/currency.vo";
import { VariantId } from "../../domain/value-objects/variant-id.vo";
import { Quantity } from "../../domain/value-objects/quantity.vo";
import { PromoData } from "../../domain/value-objects/applied-promos.vo";

// DTOs for service operations
export interface CreateCartDto {
  userId?: string;
  guestToken?: string;
  currency: string;
  createReservation?: boolean;
  reservationDurationMinutes?: number;
}

export interface AddToCartDto {
  cartId?: string;
  userId?: string;
  guestToken?: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  appliedPromos?: PromoData[];
  isGift?: boolean;
  giftMessage?: string;
  createReservation?: boolean;
}

export interface UpdateCartItemDto {
  cartId: string;
  variantId: string;
  quantity: number;
  userId?: string;
  guestToken?: string;
}

export interface RemoveFromCartDto {
  cartId: string;
  variantId: string;
  userId?: string;
  guestToken?: string;
}

export interface TransferCartDto {
  guestToken: string;
  userId: string;
  mergeWithExisting?: boolean;
}

export interface CartSummaryDto {
  cartId: string;
  isUserCart: boolean;
  isGuestCart: boolean;
  currency: string;
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  hasGiftItems: boolean;
  hasFreeShipping: boolean;
  isEmpty: boolean;
  isReservationExpired: boolean;
  reservationExpiresAt?: Date;
  updatedAt: Date;
}

export interface CartItemDto {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  appliedPromos: PromoData[];
  isGift: boolean;
  giftMessage?: string;
  hasPromosApplied: boolean;
  hasFreeShipping: boolean;
}

export interface CartDto {
  cartId: string;
  userId?: string;
  guestToken?: string;
  currency: string;
  items: CartItemDto[];
  summary: CartSummaryDto;
  reservationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CartManagementService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly reservationRepository: ReservationRepository
  ) {}

  // Cart creation
  async createUserCart(dto: CreateCartDto & { userId: string }): Promise<CartDto> {
    // Check if user already has an active cart
    const existingCart = await this.cartRepository.findActiveCartByUserId(
      UserId.fromString(dto.userId)
    );

    if (existingCart) {
      return this.mapCartToDto(existingCart);
    }

    // Create new cart
    const cartData: CreateShoppingCartData & { userId: string } = {
      userId: dto.userId,
      currency: dto.currency,
      reservationExpiresAt: dto.createReservation
        ? new Date(Date.now() + (dto.reservationDurationMinutes || 30) * 60 * 1000)
        : undefined,
    };

    const cart = ShoppingCart.createForUser(cartData);
    await this.cartRepository.save(cart);

    return this.mapCartToDto(cart);
  }

  async createGuestCart(dto: CreateCartDto & { guestToken: string }): Promise<CartDto> {
    // Create new guest cart
    const cartData: CreateShoppingCartData & { guestToken: string } = {
      guestToken: dto.guestToken,
      currency: dto.currency,
      reservationExpiresAt: dto.createReservation
        ? new Date(Date.now() + (dto.reservationDurationMinutes || 30) * 60 * 1000)
        : undefined,
    };

    const cart = ShoppingCart.createForGuest(cartData);
    await this.cartRepository.save(cart);

    return this.mapCartToDto(cart);
  }

  // Cart retrieval
  async getCart(cartId: string, userId?: string, guestToken?: string): Promise<CartDto | null> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));

    if (!cart) {
      return null;
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(cart, userId, guestToken);
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    return this.mapCartToDto(cart);
  }

  async getActiveCartByUser(userId: string): Promise<CartDto | null> {
    const cart = await this.cartRepository.findActiveCartByUserId(
      UserId.fromString(userId)
    );

    return cart ? this.mapCartToDto(cart) : null;
  }

  async getActiveCartByGuestToken(guestToken: string): Promise<CartDto | null> {
    const cart = await this.cartRepository.findActiveCartByGuestToken(
      GuestToken.fromString(guestToken)
    );

    return cart ? this.mapCartToDto(cart) : null;
  }

  // Item management
  async addToCart(dto: AddToCartDto): Promise<CartDto> {
    let cart: ShoppingCart | null = null;

    // Find or create cart
    if (dto.cartId) {
      cart = await this.cartRepository.findById(CartId.fromString(dto.cartId));
      if (!cart) {
        throw new Error("Cart not found");
      }
    } else if (dto.userId) {
      cart = await this.cartRepository.findActiveCartByUserId(
        UserId.fromString(dto.userId)
      );
      if (!cart) {
        // Create new user cart
        const newCartDto = await this.createUserCart({
          userId: dto.userId,
          currency: "USD", // Default currency - could be passed in
          createReservation: dto.createReservation,
        });
        cart = await this.cartRepository.findById(CartId.fromString(newCartDto.cartId));
      }
    } else if (dto.guestToken) {
      cart = await this.cartRepository.findActiveCartByGuestToken(
        GuestToken.fromString(dto.guestToken)
      );
      if (!cart) {
        // Create new guest cart
        const newCartDto = await this.createGuestCart({
          guestToken: dto.guestToken,
          currency: "USD", // Default currency - could be passed in
          createReservation: dto.createReservation,
        });
        cart = await this.cartRepository.findById(CartId.fromString(newCartDto.cartId));
      }
    }

    if (!cart) {
      throw new Error("Unable to find or create cart");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(cart, dto.userId, dto.guestToken);
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    // Create reservation if requested
    if (dto.createReservation) {
      await this.reservationRepository.reserveInventory(
        cart.getCartId(),
        VariantId.fromString(dto.variantId),
        dto.quantity
      );
    }

    // Add item to cart
    const itemData: Omit<CreateCartItemData, 'cartId'> = {
      variantId: dto.variantId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      appliedPromos: dto.appliedPromos,
      isGift: dto.isGift,
      giftMessage: dto.giftMessage,
    };

    cart.addItem(itemData);
    await this.cartRepository.update(cart);

    return this.mapCartToDto(cart);
  }

  async updateCartItem(dto: UpdateCartItemDto): Promise<CartDto> {
    const cart = await this.cartRepository.findById(CartId.fromString(dto.cartId));

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(cart, dto.userId, dto.guestToken);
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    // Update reservation if exists
    const reservation = await this.reservationRepository.findByCartAndVariant(
      cart.getCartId(),
      VariantId.fromString(dto.variantId)
    );

    if (reservation) {
      if (dto.quantity > 0) {
        reservation.updateQuantity(dto.quantity);
        await this.reservationRepository.update(reservation);
      } else {
        await this.reservationRepository.delete(reservation.getReservationId());
      }
    }

    // Update cart item
    cart.updateItemQuantity(dto.variantId, dto.quantity);
    await this.cartRepository.update(cart);

    return this.mapCartToDto(cart);
  }

  async removeFromCart(dto: RemoveFromCartDto): Promise<CartDto> {
    const cart = await this.cartRepository.findById(CartId.fromString(dto.cartId));

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(cart, dto.userId, dto.guestToken);
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    // Remove reservation if exists
    await this.reservationRepository.deleteByCartAndVariant(
      cart.getCartId(),
      VariantId.fromString(dto.variantId)
    );

    // Remove from cart
    cart.removeItem(dto.variantId);
    await this.cartRepository.update(cart);

    return this.mapCartToDto(cart);
  }

  async clearCart(cartId: string, userId?: string, guestToken?: string): Promise<CartDto> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(cart, userId, guestToken);
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    // Clear all reservations for this cart
    await this.reservationRepository.deleteByCartId(cart.getCartId());

    // Clear cart items
    cart.clearItems();
    await this.cartRepository.update(cart);

    return this.mapCartToDto(cart);
  }

  // Cart transfer and merging
  async transferGuestCartToUser(dto: TransferCartDto): Promise<CartDto> {
    const guestCart = await this.cartRepository.findActiveCartByGuestToken(
      GuestToken.fromString(dto.guestToken)
    );

    if (!guestCart) {
      throw new Error("Guest cart not found");
    }

    if (dto.mergeWithExisting) {
      // Check if user has existing cart
      const userCart = await this.cartRepository.findActiveCartByUserId(
        UserId.fromString(dto.userId)
      );

      if (userCart) {
        // Merge guest cart into user cart
        userCart.mergeWith(guestCart);
        await this.cartRepository.update(userCart);

        // Transfer reservations
        const guestReservations = await this.reservationRepository.findActiveByCartId(
          guestCart.getCartId()
        );
        for (const reservation of guestReservations) {
          // Create new reservations for user cart
          await this.reservationRepository.createReservation(
            userCart.getCartId(),
            reservation.getVariantId(),
            reservation.getQuantity()
          );
        }

        // Delete guest cart and its reservations
        await this.reservationRepository.deleteByCartId(guestCart.getCartId());
        await this.cartRepository.delete(guestCart.getCartId());

        return this.mapCartToDto(userCart);
      }
    }

    // Transfer ownership of guest cart to user
    const transferredCart = guestCart.transferToUser(dto.userId);
    await this.cartRepository.update(transferredCart);

    return this.mapCartToDto(transferredCart);
  }

  // Utility methods
  private async validateCartOwnership(
    cart: ShoppingCart,
    userId?: string,
    guestToken?: string
  ): Promise<boolean> {
    if (cart.isUserCart() && userId) {
      return cart.getUserId()?.getValue() === userId;
    }

    if (cart.isGuestCart() && guestToken) {
      return cart.getGuestToken()?.getValue() === guestToken;
    }

    return false;
  }

  private mapCartToDto(cart: ShoppingCart): CartDto {
    const summary = cart.getSummary();

    return {
      cartId: cart.getCartId().getValue(),
      userId: cart.getUserId()?.getValue(),
      guestToken: cart.getGuestToken()?.getValue(),
      currency: cart.getCurrency().getValue(),
      items: cart.getItems().map(item => this.mapCartItemToDto(item)),
      summary: summary as CartSummaryDto,
      reservationExpiresAt: cart.getReservationExpiresAt() || undefined,
      createdAt: cart.getCreatedAt(),
      updatedAt: cart.getUpdatedAt(),
    };
  }

  private mapCartItemToDto(item: CartItem): CartItemDto {
    return {
      id: item.getId(),
      variantId: item.getVariantId().getValue(),
      quantity: item.getQuantity().getValue(),
      unitPrice: item.getUnitPrice(),
      subtotal: item.getSubtotal(),
      discountAmount: item.getDiscountAmount(),
      totalPrice: item.getTotalPrice(),
      appliedPromos: item.getAppliedPromos().getValue(),
      isGift: item.isGiftItem(),
      giftMessage: item.getGiftMessage(),
      hasPromosApplied: item.hasPromosApplied(),
      hasFreeShipping: item.hasFreeShipping(),
    };
  }

  // Cart cleanup and maintenance
  async cleanupExpiredCarts(): Promise<number> {
    return await this.cartRepository.cleanupExpiredGuestCarts();
  }

  async getCartStatistics(): Promise<any> {
    return await this.cartRepository.getCartStatistics();
  }
}