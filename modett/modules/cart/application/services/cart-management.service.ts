import { CartRepository } from "../../domain/repositories/cart.repository";
import { ReservationRepository } from "../../domain/repositories/reservation.repository";
import { CheckoutRepository } from "../../domain/repositories/checkout.repository";
import {
  ShoppingCart,
  CreateShoppingCartData,
} from "../../domain/entities/shopping-cart.entity";
import {
  CartItem,
  CreateCartItemData,
} from "../../domain/entities/cart-item.entity";
import { CartId } from "../../domain/value-objects/cart-id.vo";
import { UserId } from "../../../user-management/domain/value-objects/user-id.vo";
import { GuestToken } from "../../domain/value-objects/guest-token.vo";
import { Currency } from "../../domain/value-objects/currency.vo";
import { VariantId } from "../../domain/value-objects/variant-id.vo";
import { Quantity } from "../../domain/value-objects/quantity.vo";
import { PromoData } from "../../domain/value-objects/applied-promos.vo";
import { IProductVariantRepository } from "../../../product-catalog/domain/repositories/product-variant.repository";
import { VariantId as ProductVariantId } from "../../../product-catalog/domain/value-objects/variant-id.vo";
import { IProductRepository } from "../../../product-catalog/domain/repositories/product.repository";
import { IProductMediaRepository } from "../../../product-catalog/domain/repositories/product-media.repository";
import { IMediaAssetRepository } from "../../../product-catalog/domain/repositories/media-asset.repository";
import { ProductId } from "../../../product-catalog/domain/value-objects/product-id.vo";
import { MediaAssetId } from "../../../product-catalog/domain/entities/media-asset.entity";

// DTOs for service operations
export interface CreateCartDto {
  userId?: string;
  guestToken?: string;
  currency: string;
  reservationDurationMinutes?: number;
}

export interface AddToCartDto {
  cartId?: string;
  userId?: string;
  guestToken?: string;
  variantId: string;
  quantity: number;
  appliedPromos?: PromoData[];
  isGift?: boolean;
  giftMessage?: string;
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
  // Product details
  product?: {
    productId: string;
    title: string;
    slug: string;
    images: Array<{ url: string; alt?: string }>;
  };
  // Variant details
  variant?: {
    size: string | null;
    color: string | null;
    sku: string;
  };
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

  // Checkout fields
  email?: string;
  shippingMethod?: string;
  shippingOption?: string;
  isGift?: boolean;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  shippingCountryCode?: string;
  shippingPhone?: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingProvince?: string;
  billingPostalCode?: string;
  billingCountryCode?: string;
  billingPhone?: string;
  sameAddressForBilling?: boolean;
}

export class CartManagementService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly checkoutRepository: CheckoutRepository,
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository,
    private readonly productMediaRepository: IProductMediaRepository,
    private readonly mediaAssetRepository: IMediaAssetRepository
  ) {}

  // Cart creation
  async createUserCart(
    dto: CreateCartDto & { userId: string }
  ): Promise<CartDto> {
    try {
      console.log("Creating user cart with data:", dto);

      // Check if user already has an active cart
      const existingCart = await this.cartRepository.findActiveCartByUserId(
        UserId.fromString(dto.userId)
      );

      if (existingCart) {
        console.log(
          "Existing cart found:",
          existingCart.getCartId().getValue()
        );

        // Update existing cart with new reservation settings if provided
        if (dto.reservationDurationMinutes) {
          const newExpiryTime = new Date(
            Date.now() + dto.reservationDurationMinutes * 60 * 1000
          );
          existingCart.updateReservationExpiry(newExpiryTime);
          await this.cartRepository.update(existingCart);
          console.log("Updated existing cart reservation to:", newExpiryTime);
        }

        return await this.mapCartToDto(existingCart);
      }

      // Create new cart
      const cartData: CreateShoppingCartData & { userId: string } = {
        userId: dto.userId,
        currency: dto.currency,
        reservationExpiresAt: new Date(
          Date.now() + (dto.reservationDurationMinutes || 30) * 60 * 1000
        ), // Always create with reservation expiry
      };

      console.log("Cart data to create:", cartData);
      const cart = ShoppingCart.createForUser(cartData);
      console.log("Cart entity created:", cart.getCartId().getValue());

      await this.cartRepository.save(cart);
      console.log("Cart saved to database");

      return await this.mapCartToDto(cart);
    } catch (error) {
      console.error("Error creating user cart:", error);
      throw error;
    }
  }

  async createGuestCart(
    dto: CreateCartDto & { guestToken: string }
  ): Promise<CartDto> {
    try {
      console.log("Creating guest cart with data:", dto);

      // Check if a cart already exists for this guest token (active or not)
      const existingCart = await this.cartRepository.findByGuestToken(
        GuestToken.fromString(dto.guestToken)
      );

      if (existingCart) {
        console.log(
          "Existing cart found:",
          existingCart.getCartId().getValue()
        );

        // CRITICAL: Check if this cart has a completed checkout
        // If so, don't reuse it - create a fresh cart instead
        const existingCheckout = await this.checkoutRepository.findByCartId(
          existingCart.getCartId()
        );

        if (!existingCheckout || !existingCheckout.isCompleted()) {
          // Safe to reuse - update reservation expiry and return existing cart
          const newExpiryTime = new Date(
            Date.now() + (dto.reservationDurationMinutes || 30) * 60 * 1000
          );
          existingCart.updateReservationExpiry(newExpiryTime);
          await this.cartRepository.update(existingCart);
          console.log("Updated existing cart reservation to:", newExpiryTime);

          return await this.mapCartToDto(existingCart);
        } else {
          console.log("Existing cart has completed checkout - creating new cart");
          // Fall through to create new cart
        }
      }

      // Create new guest cart
      const cartData: CreateShoppingCartData & { guestToken: string } = {
        guestToken: dto.guestToken,
        currency: dto.currency,
        reservationExpiresAt: new Date(
          Date.now() + (dto.reservationDurationMinutes || 30) * 60 * 1000
        ), // Always create with reservation expiry
      };

      console.log("Guest cart data to create:", cartData);
      const cart = ShoppingCart.createForGuest(cartData);
      console.log("Guest cart entity created:", cart.getCartId().getValue());

      await this.cartRepository.save(cart);
      console.log("Guest cart saved to database");

      return await this.mapCartToDto(cart);
    } catch (error) {
      console.error("Error creating guest cart:", error);
      throw error;
    }
  }

  // Cart retrieval
  async getCart(
    cartId: string,
    userId?: string,
    guestToken?: string
  ): Promise<CartDto | null> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));

    if (!cart) {
      return null;
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(cart, userId, guestToken);
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    return await this.mapCartToDto(cart);
  }

  async getActiveCartByUser(userId: string): Promise<CartDto | null> {
    const cart = await this.cartRepository.findActiveCartByUserId(
      UserId.fromString(userId)
    );

    return cart ? await this.mapCartToDto(cart) : null;
  }

  async getActiveCartByGuestToken(guestToken: string): Promise<CartDto | null> {
    const cart = await this.cartRepository.findActiveCartByGuestToken(
      GuestToken.fromString(guestToken)
    );

    return cart ? await this.mapCartToDto(cart) : null;
  }

  // Item management
  async addToCart(dto: AddToCartDto): Promise<CartDto> {
    let cart: ShoppingCart | null = null;

    // Fetch product variant to get the price
    const productVariant = await this.productVariantRepository.findById(
      ProductVariantId.fromString(dto.variantId)
    );

    if (!productVariant) {
      throw new Error("Product variant not found");
    }

    // Get the unit price from the product variant
    const unitPrice = productVariant.getPrice().getValue();

    // Find or create cart
    if (dto.cartId) {
      cart = await this.cartRepository.findById(CartId.fromString(dto.cartId));
      if (!cart) {
        throw new Error("Cart not found");
      }

      // CRITICAL: Check if this cart has a completed checkout
      // If so, we should NOT add items to it - create a new cart instead
      const existingCheckout = await this.checkoutRepository.findByCartId(
        CartId.fromString(dto.cartId)
      );
      if (existingCheckout && existingCheckout.isCompleted()) {
        // Cart has a completed order - create a new cart instead
        if (dto.guestToken) {
          const newCartDto = await this.createGuestCart({
            guestToken: dto.guestToken,
            currency: cart.getCurrency().toString(),
          });
          cart = await this.cartRepository.findById(
            CartId.fromString(newCartDto.cartId)
          );
        } else if (dto.userId) {
          const newCartDto = await this.createUserCart({
            userId: dto.userId,
            currency: cart.getCurrency().toString(),
          });
          cart = await this.cartRepository.findById(
            CartId.fromString(newCartDto.cartId)
          );
        } else {
          throw new Error("Cannot add items to a cart with a completed order");
        }
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
        });
        cart = await this.cartRepository.findById(
          CartId.fromString(newCartDto.cartId)
        );
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
        });
        cart = await this.cartRepository.findById(
          CartId.fromString(newCartDto.cartId)
        );
      }
    }

    if (!cart) {
      throw new Error("Unable to find or create cart");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(
      cart,
      dto.userId,
      dto.guestToken
    );
    if (!isOwner) {
      throw new Error("Unauthorized access to cart");
    }

    // Check if reservation already exists for this cart+variant
    const existingReservation =
      await this.reservationRepository.findByCartAndVariant(
        cart.getCartId(),
        VariantId.fromString(dto.variantId)
      );

    if (existingReservation) {
      // Update existing reservation quantity if needed
      const currentReservedQty = existingReservation.getQuantity().getValue();
      const existingCartItem = cart.findItemByVariantId(dto.variantId);
      const currentCartQty = existingCartItem
        ? existingCartItem.getQuantity().getValue()
        : 0;
      const newTotalQty = currentCartQty + dto.quantity;

      if (newTotalQty > currentReservedQty) {
        // Need to reserve additional quantity
        await this.reservationRepository.adjustReservation(
          cart.getCartId(),
          VariantId.fromString(dto.variantId),
          newTotalQty
        );
      }
    } else {
      // Create new reservation
      await this.reservationRepository.reserveInventory(
        cart.getCartId(),
        VariantId.fromString(dto.variantId),
        dto.quantity
      );
    }

    // Add item to cart with the fetched unit price
    const itemData: Omit<CreateCartItemData, "cartId"> = {
      variantId: dto.variantId,
      quantity: dto.quantity,
      unitPrice: unitPrice,
      appliedPromos: dto.appliedPromos,
      isGift: dto.isGift,
      giftMessage: dto.giftMessage,
    };

    cart.addItem(itemData);
    await this.cartRepository.update(cart);

    return await this.mapCartToDto(cart);
  }

  async updateCartItem(dto: UpdateCartItemDto): Promise<CartDto> {
    const cart = await this.cartRepository.findById(
      CartId.fromString(dto.cartId)
    );

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(
      cart,
      dto.userId,
      dto.guestToken
    );
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

    return await this.mapCartToDto(cart);
  }

  async removeFromCart(dto: RemoveFromCartDto): Promise<CartDto> {
    const cart = await this.cartRepository.findById(
      CartId.fromString(dto.cartId)
    );

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Validate ownership
    const isOwner = await this.validateCartOwnership(
      cart,
      dto.userId,
      dto.guestToken
    );
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

    return await this.mapCartToDto(cart);
  }

  async clearCart(
    cartId: string,
    userId?: string,
    guestToken?: string
  ): Promise<CartDto> {
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

    return await this.mapCartToDto(cart);
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
        const guestReservations =
          await this.reservationRepository.findActiveByCartId(
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

        return await this.mapCartToDto(userCart);
      }
    }

    // Transfer ownership of guest cart to user
    const transferredCart = guestCart.transferToUser(dto.userId);
    await this.cartRepository.update(transferredCart);

    return await this.mapCartToDto(transferredCart);
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

  private async mapCartToDto(cart: ShoppingCart): Promise<CartDto> {
    const summary = cart.getSummary();

    // Map all cart items with product details
    const items = await Promise.all(
      cart.getItems().map((item) => this.mapCartItemToDto(item))
    );

    // Fetch checkout fields from database (they're not in the domain entity)
    const cartWithCheckoutInfo = await this.cartRepository.getCartWithCheckoutInfo(
      cart.getCartId().getValue()
    );

    console.log('=== DEBUG: Cart Checkout Info ===');
    console.log('Cart ID:', cart.getCartId().getValue());
    console.log('Checkout Info:', cartWithCheckoutInfo);
    console.log('Email:', cartWithCheckoutInfo?.email);
    console.log('=================================');

    return {
      cartId: cart.getCartId().getValue(),
      userId: cart.getUserId()?.getValue(),
      guestToken: cart.getGuestToken()?.getValue(),
      currency: cart.getCurrency().getValue(),
      items,
      summary: summary as CartSummaryDto,
      reservationExpiresAt: cart.getReservationExpiresAt() || undefined,
      createdAt: cart.getCreatedAt(),
      updatedAt: cart.getUpdatedAt(),

      // Checkout fields from database
      email: cartWithCheckoutInfo?.email || undefined,
      shippingMethod: cartWithCheckoutInfo?.shippingMethod || undefined,
      shippingOption: cartWithCheckoutInfo?.shippingOption || undefined,
      isGift: cartWithCheckoutInfo?.isGift || undefined,
      shippingFirstName: cartWithCheckoutInfo?.shippingFirstName || undefined,
      shippingLastName: cartWithCheckoutInfo?.shippingLastName || undefined,
      shippingAddress1: cartWithCheckoutInfo?.shippingAddress1 || undefined,
      shippingAddress2: cartWithCheckoutInfo?.shippingAddress2 || undefined,
      shippingCity: cartWithCheckoutInfo?.shippingCity || undefined,
      shippingProvince: cartWithCheckoutInfo?.shippingProvince || undefined,
      shippingPostalCode: cartWithCheckoutInfo?.shippingPostalCode || undefined,
      shippingCountryCode: cartWithCheckoutInfo?.shippingCountryCode || undefined,
      shippingPhone: cartWithCheckoutInfo?.shippingPhone || undefined,
      billingFirstName: cartWithCheckoutInfo?.billingFirstName || undefined,
      billingLastName: cartWithCheckoutInfo?.billingLastName || undefined,
      billingAddress1: cartWithCheckoutInfo?.billingAddress1 || undefined,
      billingAddress2: cartWithCheckoutInfo?.billingAddress2 || undefined,
      billingCity: cartWithCheckoutInfo?.billingCity || undefined,
      billingProvince: cartWithCheckoutInfo?.billingProvince || undefined,
      billingPostalCode: cartWithCheckoutInfo?.billingPostalCode || undefined,
      billingCountryCode: cartWithCheckoutInfo?.billingCountryCode || undefined,
      billingPhone: cartWithCheckoutInfo?.billingPhone || undefined,
      sameAddressForBilling: cartWithCheckoutInfo?.sameAddressForBilling || undefined,
    };
  }

  private async mapCartItemToDto(item: CartItem): Promise<CartItemDto> {
    const variantId = item.getVariantId().getValue();

    // Fetch variant details
    const variant = await this.productVariantRepository.findById(
      ProductVariantId.fromString(variantId)
    );

    let productDetails = undefined;
    let variantDetails = undefined;

    if (variant) {
      // Get variant details
      variantDetails = {
        size: variant.getSize(),
        color: variant.getColor(),
        sku: variant.getSku().getValue(),
      };

      // Fetch product details
      const productId = variant.getProductId();
      const product = await this.productRepository.findById(productId);

      if (product) {
        // Fetch product images
        const productMediaList = await this.productMediaRepository.findByProductId(
          productId,
          { sortBy: 'position', sortOrder: 'asc' }
        );

        const images = await Promise.all(
          productMediaList.map(async (media) => {
            // Convert value-objects MediaAssetId to entity MediaAssetId
            const assetId = MediaAssetId.fromString(media.getAssetId().getValue());
            const asset = await this.mediaAssetRepository.findById(assetId);
            return {
              url: asset?.getStorageKey() || '',
              alt: asset?.getAltText() || undefined,
            };
          })
        );

        productDetails = {
          productId: product.getId().getValue(),
          title: product.getTitle(),
          slug: product.getSlug().getValue(),
          images,
        };
      }
    }

    return {
      id: item.getId(),
      variantId,
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
      product: productDetails,
      variant: variantDetails,
    };
  }

  // Cart cleanup and maintenance
  async cleanupExpiredCarts(): Promise<number> {
    return await this.cartRepository.cleanupExpiredGuestCarts();
  }

  async getCartStatistics(): Promise<any> {
    return await this.cartRepository.getCartStatistics();
  }

  // Checkout field updates
  async updateCartEmail(cartId: string, email: string, userId?: string, guestToken?: string): Promise<void> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Validate ownership - more explicit logic
    const cartUserId = cart.getUserId()?.getValue();
    const cartGuestToken = cart.getGuestToken()?.getValue();

    // Cart belongs to a user
    if (cartUserId) {
      if (!userId || cartUserId !== userId) {
        throw new Error('Unauthorized: Cart does not belong to user');
      }
    }
    // Cart belongs to a guest
    else if (cartGuestToken) {
      if (!guestToken || cartGuestToken !== guestToken) {
        throw new Error('Unauthorized: Cart does not belong to guest');
      }
    }
    // Orphaned cart (no owner)
    else {
      throw new Error('Unauthorized: Cart has no owner');
    }

    await this.cartRepository.updateEmail(CartId.fromString(cartId), email);
  }

  async updateCartShippingInfo(
    cartId: string,
    data: {
      shippingMethod?: string;
      shippingOption?: string;
      isGift?: boolean;
    },
    userId?: string,
    guestToken?: string
  ): Promise<void> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Validate ownership - more explicit logic
    const cartUserId = cart.getUserId()?.getValue();
    const cartGuestToken = cart.getGuestToken()?.getValue();

    // Cart belongs to a user
    if (cartUserId) {
      if (!userId || cartUserId !== userId) {
        throw new Error('Unauthorized: Cart does not belong to user');
      }
    }
    // Cart belongs to a guest
    else if (cartGuestToken) {
      if (!guestToken || cartGuestToken !== guestToken) {
        throw new Error('Unauthorized: Cart does not belong to guest');
      }
    }
    // Orphaned cart (no owner)
    else {
      throw new Error('Unauthorized: Cart has no owner');
    }

    await this.cartRepository.updateShippingInfo(CartId.fromString(cartId), data);
  }

  async updateCartAddresses(
    cartId: string,
    data: {
      shippingFirstName?: string;
      shippingLastName?: string;
      shippingAddress1?: string;
      shippingAddress2?: string;
      shippingCity?: string;
      shippingProvince?: string;
      shippingPostalCode?: string;
      shippingCountryCode?: string;
      shippingPhone?: string;
      billingFirstName?: string;
      billingLastName?: string;
      billingAddress1?: string;
      billingAddress2?: string;
      billingCity?: string;
      billingProvince?: string;
      billingPostalCode?: string;
      billingCountryCode?: string;
      billingPhone?: string;
      sameAddressForBilling?: boolean;
    },
    userId?: string,
    guestToken?: string
  ): Promise<void> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Validate ownership - more explicit logic
    const cartUserId = cart.getUserId()?.getValue();
    const cartGuestToken = cart.getGuestToken()?.getValue();

    // Cart belongs to a user
    if (cartUserId) {
      if (!userId || cartUserId !== userId) {
        throw new Error('Unauthorized: Cart does not belong to user');
      }
    }
    // Cart belongs to a guest
    else if (cartGuestToken) {
      if (!guestToken || cartGuestToken !== guestToken) {
        throw new Error('Unauthorized: Cart does not belong to guest');
      }
    }
    // Orphaned cart (no owner)
    else {
      throw new Error('Unauthorized: Cart has no owner');
    }

    await this.cartRepository.updateAddresses(CartId.fromString(cartId), data);
  }

  async getCartWithCheckoutInfo(cartId: string, userId?: string, guestToken?: string): Promise<any> {
    const cart = await this.cartRepository.findById(CartId.fromString(cartId));
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Validate ownership - more explicit logic
    const cartUserId = cart.getUserId()?.getValue();
    const cartGuestToken = cart.getGuestToken()?.getValue();

    // Cart belongs to a user
    if (cartUserId) {
      if (!userId || cartUserId !== userId) {
        throw new Error('Unauthorized: Cart does not belong to user');
      }
    }
    // Cart belongs to a guest
    else if (cartGuestToken) {
      if (!guestToken || cartGuestToken !== guestToken) {
        throw new Error('Unauthorized: Cart does not belong to guest');
      }
    }
    // Orphaned cart (no owner)
    else {
      throw new Error('Unauthorized: Cart has no owner');
    }

    return await this.cartRepository.getCartWithCheckoutInfo(cartId);
  }
}
