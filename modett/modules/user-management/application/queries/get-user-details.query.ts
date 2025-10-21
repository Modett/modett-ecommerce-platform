import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { IAddressRepository } from "../../domain/repositories/iaddress.repository";
import { UserId } from "../../domain/value-objects/user-id.vo";

export interface GetUserDetailsQuery {
  userId: string;
  timestamp: Date;
}

export interface GetUserDetailsResult {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    isGuest: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
  errors?: string[];
}

export class GetUserDetailsHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly addressRepository: IAddressRepository
  ) {}

  async handle(query: GetUserDetailsQuery): Promise<GetUserDetailsResult> {
    try {
      // Validate query
      if (!query.userId) {
        return {
          success: false,
          error: "User ID is required",
          errors: ["userId"],
        };
      }

      // Fetch user
      const userId = UserId.fromString(query.userId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return {
          success: false,
          error: "User not found",
          errors: [],
        };
      }

      // Fetch user's addresses to get firstName and lastName
      const addresses = await this.addressRepository.findByUserId(userId);

      // Try to get default address first, otherwise use the first address
      const defaultAddress = addresses.find((addr) => addr.getIsDefault());
      const addressToUse = defaultAddress || addresses[0];

      const userData = user.toData();

      // Get firstName and lastName from the address value object
      let firstName: string | null = null;
      let lastName: string | null = null;
      let phone: string | null = null;

      if (addressToUse) {
        const addressValue = addressToUse.getAddressValue();
        firstName = addressValue.getFirstName() || null;
        lastName = addressValue.getLastName() || null;
        phone = addressValue.getPhone() || null;
      }

      return {
        success: true,
        data: {
          userId: userData.id,
          email: userData.email,
          phone: phone,
          firstName: firstName,
          lastName: lastName,
          status: userData.status,
          emailVerified: userData.emailVerified,
          phoneVerified: userData.phoneVerified,
          isGuest: userData.isGuest,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get user details",
        errors: [],
      };
    }
  }
}
