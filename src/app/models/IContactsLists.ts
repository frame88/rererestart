export interface IContactsLists {
  success: boolean;
  errorMessage: string;
  debugMessage: string;
  data: [
    {
      id: number;
      username: string;
      name: string;
      surname: string;
      email: string;
      status: string;
      statusDate: Date;
      lastSeenOnline: Date;
      fullname: string;
      nickname: string;
      createdDate: Date;
    }
  ];
}

