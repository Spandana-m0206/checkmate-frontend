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
  accessToken: string;
  user: User;
  isNewUser: false;
}

export interface VerifyOtpNewUser {
  isNewUser: true;
}

export type VerifyOtpData = VerifyOtpExistingUser | VerifyOtpNewUser;

export interface RegisterData {
  accessToken: string;
  user: User;
}
