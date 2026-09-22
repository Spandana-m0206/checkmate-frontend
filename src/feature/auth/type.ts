export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  dateOfBirth: string;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendOtpResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface VerifyOtpExistingUser {
  token: string;
  user: User;
  isNewUser: false;
}

export interface VerifyOtpNewUser {
  registrationToken: string;
  isNewUser: true;
}

export type VerifyOtpData = VerifyOtpExistingUser | VerifyOtpNewUser;

export interface RegisterData {
  token: string;
  user: User;
}
