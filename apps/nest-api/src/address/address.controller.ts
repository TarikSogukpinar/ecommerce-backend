import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CustomRequest } from 'src/core/request/customRequest';
import { CreateAddressDto } from './dto/requests/createAddress.dto';
import { AddressService } from './address.service';

@Controller({ path: 'address', version: '1' })
@ApiTags('Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('createAddress')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;
    return this.addressService.createAddress(createAddressDto, userId);
  }
}
