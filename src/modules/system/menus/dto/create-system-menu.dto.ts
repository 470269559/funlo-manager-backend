export class CreateSystemMenuDto {
  parentId?: number | null;
  menuName: string;
  path?: string | null;
  component?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
}
