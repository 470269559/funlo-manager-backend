export class CreateDictionaryItemDto {
  itemLabel: string;
  itemValue: string;
  sortOrder?: number;
  isEnabled?: boolean;
}
