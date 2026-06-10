import { Module } from '@nestjs/common';
import { SystemDictionariesController } from './system-dictionaries.controller';
import { SystemDictionariesService } from './system-dictionaries.service';

@Module({
  controllers: [SystemDictionariesController],
  providers: [SystemDictionariesService],
})
export class SystemDictionariesModule {}
