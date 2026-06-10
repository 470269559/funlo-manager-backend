export class CreateSystemRoleDto {
  roleName: string;
  roleCode: string;
  description?: string | null;
  isEnabled?: boolean;
  menuIds?: number[];
}
