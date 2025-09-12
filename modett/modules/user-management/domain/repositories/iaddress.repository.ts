// Address repository interface
import { Address } from "../entities/address.entity";

export interface IAddressRepository {
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  create(address: Address): Promise<Address>;
  update(address: Address): Promise<Address>;
  delete(id: string): Promise<void>;
}
