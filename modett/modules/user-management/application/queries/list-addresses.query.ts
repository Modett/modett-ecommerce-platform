import { AddressManagementService, AddressResponseDto } from '../services/address-management.service';
import { CommandResult } from '../commands/register-user.command';
import { IQuery, IQueryHandler } from './get-user-profile.query';

export interface ListAddressesQuery extends IQuery {
  userId: string;
  type?: 'billing' | 'shipping';
}

export interface AddressListItem {
  addressId: string;
  type: string;
  isDefault: boolean;
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  createdAt: Date;
}

export interface ListAddressesResult {
  userId: string;
  addresses: AddressListItem[];
  totalCount: number;
}

export class ListAddressesHandler implements IQueryHandler<ListAddressesQuery, CommandResult<ListAddressesResult>> {
  constructor(
    private readonly addressService: AddressManagementService
  ) {}

  async handle(query: ListAddressesQuery): Promise<CommandResult<ListAddressesResult>> {
    try {
      // Validate query
      if (!query.userId) {
        return CommandResult.failure<ListAddressesResult>(
          'User ID is required',
          ['userId']
        );
      }

      // Get addresses through service
      const addresses = await this.addressService.getUserAddresses(query.userId);

      // Filter by type if specified
      const filteredAddresses = query.type
        ? addresses.filter((addr: AddressResponseDto) => addr.type === query.type)
        : addresses;

      // Map to result format
      const addressItems: AddressListItem[] = filteredAddresses.map((address: AddressResponseDto) => ({
        addressId: address.id,
        type: address.type,
        isDefault: address.isDefault,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        createdAt: address.createdAt
      }));

      const result: ListAddressesResult = {
        userId: query.userId,
        addresses: addressItems,
        totalCount: addressItems.length
      };

      return CommandResult.success<ListAddressesResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ListAddressesResult>(
          'Failed to retrieve addresses',
          [error.message]
        );
      }

      return CommandResult.failure<ListAddressesResult>(
        'An unexpected error occurred while retrieving addresses'
      );
    }
  }
}