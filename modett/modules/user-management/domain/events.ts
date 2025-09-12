// Domain events for user management
export interface UserCreatedEvent {
  userId: string;
  email: string;
  timestamp: Date;
}

export interface UserUpdatedEvent {
  userId: string;
  timestamp: Date;
}

export interface UserDeletedEvent {
  userId: string;
  timestamp: Date;
}
