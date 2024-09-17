import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/database.module';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
