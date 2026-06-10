import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SYSTEM_ERROR_MESSAGES } from '../system-error.messages';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { CreateDictionaryTypeDto } from './dto/create-dictionary-type.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import { UpdateDictionaryTypeDto } from './dto/update-dictionary-type.dto';

@Injectable()
export class SystemDictionariesService {
  constructor(private readonly prisma: PrismaService) {}

  async createType(dto: CreateDictionaryTypeDto) {
    this.validateTypeInput(dto.dictName, dto.dictCode);

    try {
      return await this.prisma.systemDictionaryType.create({
        data: {
          dictName: dto.dictName.trim(),
          dictCode: dto.dictCode.trim(),
          description: dto.description ?? null,
          isEnabled: dto.isEnabled ?? true,
        },
      });
    } catch (error) {
      this.handleUniqueError(
        error,
        SYSTEM_ERROR_MESSAGES.dictionaries.DICT_CODE_EXISTS,
      );
      throw error;
    }
  }

  findTypes() {
    return this.prisma.systemDictionaryType.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async findType(id: number) {
    const type = await this.prisma.systemDictionaryType.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!type) {
      throw new NotFoundException(
        SYSTEM_ERROR_MESSAGES.dictionaries.TYPE_NOT_FOUND,
      );
    }

    return type;
  }

  async updateType(id: number, dto: UpdateDictionaryTypeDto) {
    await this.ensureTypeExists(id);
    if (dto.dictName !== undefined || dto.dictCode !== undefined) {
      this.validateTypeInput(dto.dictName ?? 'valid', dto.dictCode ?? 'VALID');
    }

    try {
      return await this.prisma.systemDictionaryType.update({
        where: { id },
        data: {
          dictName: dto.dictName?.trim(),
          dictCode: dto.dictCode?.trim(),
          description: dto.description,
          isEnabled: dto.isEnabled,
        },
      });
    } catch (error) {
      this.handleUniqueError(
        error,
        SYSTEM_ERROR_MESSAGES.dictionaries.DICT_CODE_EXISTS,
      );
      throw error;
    }
  }

  async removeType(id: number) {
    await this.ensureTypeExists(id);
    await this.prisma.systemDictionaryType.delete({ where: { id } });
    return { success: true };
  }

  async createItem(typeId: number, dto: CreateDictionaryItemDto) {
    await this.ensureTypeExists(typeId);
    this.validateItemInput(dto.itemLabel, dto.itemValue);

    try {
      return await this.prisma.systemDictionaryItem.create({
        data: {
          typeId,
          itemLabel: dto.itemLabel.trim(),
          itemValue: dto.itemValue.trim(),
          sortOrder: dto.sortOrder ?? 0,
          isEnabled: dto.isEnabled ?? true,
        },
      });
    } catch (error) {
      this.handleUniqueError(
        error,
        SYSTEM_ERROR_MESSAGES.dictionaries.ITEM_VALUE_EXISTS,
      );
      throw error;
    }
  }

  async findItems(typeId: number) {
    await this.ensureTypeExists(typeId);
    return this.prisma.systemDictionaryItem.findMany({
      where: { typeId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async updateItem(itemId: number, dto: UpdateDictionaryItemDto) {
    await this.ensureItemExists(itemId);
    if (dto.itemLabel !== undefined || dto.itemValue !== undefined) {
      this.validateItemInput(
        dto.itemLabel ?? 'valid',
        dto.itemValue ?? 'VALID',
      );
    }

    try {
      return await this.prisma.systemDictionaryItem.update({
        where: { id: itemId },
        data: {
          itemLabel: dto.itemLabel?.trim(),
          itemValue: dto.itemValue?.trim(),
          sortOrder: dto.sortOrder,
          isEnabled: dto.isEnabled,
        },
      });
    } catch (error) {
      this.handleUniqueError(
        error,
        SYSTEM_ERROR_MESSAGES.dictionaries.ITEM_VALUE_EXISTS,
      );
      throw error;
    }
  }

  async removeItem(itemId: number) {
    await this.ensureItemExists(itemId);
    await this.prisma.systemDictionaryItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  private validateTypeInput(dictName: string, dictCode: string) {
    if (!dictName?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.dictionaries.DICT_NAME_REQUIRED,
      );
    }
    if (!dictCode?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.dictionaries.DICT_CODE_REQUIRED,
      );
    }
  }

  private validateItemInput(itemLabel: string, itemValue: string) {
    if (!itemLabel?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.dictionaries.ITEM_LABEL_REQUIRED,
      );
    }
    if (!itemValue?.trim()) {
      throw new BadRequestException(
        SYSTEM_ERROR_MESSAGES.dictionaries.ITEM_VALUE_REQUIRED,
      );
    }
  }

  private async ensureTypeExists(id: number) {
    const type = await this.prisma.systemDictionaryType.findUnique({
      where: { id },
    });
    if (!type) {
      throw new NotFoundException(
        SYSTEM_ERROR_MESSAGES.dictionaries.TYPE_NOT_FOUND,
      );
    }
    return type;
  }

  private async ensureItemExists(id: number) {
    const item = await this.prisma.systemDictionaryItem.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(
        SYSTEM_ERROR_MESSAGES.dictionaries.ITEM_NOT_FOUND,
      );
    }
    return item;
  }

  private handleUniqueError(error: unknown, message: string) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }
  }
}
