export interface IRefreshToken {
  success: boolean;
  errorMessage: string;
  debugMessage: string;
  data: {
    token: string;
    refreshToken: string;
    createdDate: Date;
    expirationDate: Date;
    refreshTokenExpirationDate: Date;
  };
}
