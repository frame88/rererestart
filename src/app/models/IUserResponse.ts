export interface IUserResponse{
  success: boolean;
  errorMessage: string;
  debugMessage: string;
  data: {
    username: string;
    name: string;
    surname: string;
    email: string;
  };
}
