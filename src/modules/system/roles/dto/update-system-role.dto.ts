export class UpdateSystemRoleDto {
  roleName?: string;
  roleCode?: string;
  description?: string | null;
  isEnabled?: boolean;
  menuIds?: number[];
}
