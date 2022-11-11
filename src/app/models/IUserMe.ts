export interface IUserMe {
  success: true;
  errorMessage: string;
  debugMessage: string;
  data: {
    id: 0;
    username: string;
    name: string;
    surname: string;
    email: string;
    status: string;
    statusDate: Date;
    lastSeenOnline: Date;
    fullname: string;
  };
}
