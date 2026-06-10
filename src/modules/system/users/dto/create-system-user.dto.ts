export class CreateSystemUserDto {
  username: string;
  password: string;
  nickname?: string | null;
  roleId: number;
  isEnabled?: boolean;
}
