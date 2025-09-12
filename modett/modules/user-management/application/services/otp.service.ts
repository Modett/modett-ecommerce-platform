// OTP service
export interface OTPService {
  generate(userId: string): Promise<string>;
  verify(userId: string, otp: string): Promise<boolean>;
}
