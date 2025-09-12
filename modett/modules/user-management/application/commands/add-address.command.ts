// Command to add address for user
export interface AddAddressCommand {
  userId: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
