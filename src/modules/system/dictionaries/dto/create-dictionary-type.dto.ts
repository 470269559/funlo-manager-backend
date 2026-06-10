export class CreateDictionaryTypeDto {
  dictName: string;
  dictCode: string;
  description?: string | null;
  isEnabled?: boolean;
}
