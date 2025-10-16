import { Appointment } from "../entities/appointment.entity";
import { AppointmentId } from "../value-objects/appointment-id.vo";

export interface AppointmentRepository {
  // Core CRUD
  save(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
  delete(appointmentId: AppointmentId): Promise<void>;
  findById(appointmentId: AppointmentId): Promise<Appointment | null>;

  // Finders
  findByUserId(userId: string): Promise<Appointment[]>;
  findByLocationId(locationId: string): Promise<Appointment[]>;
  findByType(type: string): Promise<Appointment[]>;
  findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Appointment[]>;

  // Existence checks
  exists(appointmentId: AppointmentId): Promise<boolean>;
  existsByUserIdAndTime(
    userId: string,
    startAt: Date,
    endAt: Date
  ): Promise<boolean>;

  // Business queries
  countByUserId(userId: string): Promise<number>;
  countByLocationId(locationId: string): Promise<number>;
}
