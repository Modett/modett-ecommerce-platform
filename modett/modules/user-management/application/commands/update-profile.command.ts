// Command to update user profile
export interface UpdateProfileCommand {
  userId: string;
  name?: string;
  email?: string;
}
