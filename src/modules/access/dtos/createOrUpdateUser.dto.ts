export interface CreateOrUpdateUserDto {
  isUserCreate: boolean;
  user: {
    id?: number | null;
    username: string;
    password: string;
    passwordConfirmation: string;
  };
  people: {
    id?: number | null;
    identification: string;
    names: string;
    lastnames: string;
    mobile: string | null;
    email: string;
  };
  roles: number[];
}
