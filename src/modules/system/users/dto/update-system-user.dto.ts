export class UpdateSystemUserDto {
  username?: string;
  password?: string;
  nickname?: string | null;
  roleId?: number;
  isEnabled?: boolean;
}
