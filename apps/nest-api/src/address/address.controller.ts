import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CustomRequest } from 'src/core/request/customRequest';
import { CreateAddressDto } from './dto/requests/createAddress.dto';
import { AddressService } from './address.service';
import { GetAddressByIdDto } from './dto/requests/getAddressById.dto';
import { UpdateAddressDto } from './dto/requests/updateAddress.dto';
import { DeleteAddressDto } from './dto/requests/deleteAddress.dto';

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

  @Get('/userAddress/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all addresses for user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched all addresses',
  })
  @ApiBody({ type: CreateAddressDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async getAllAddressesForUser(@Req() req: CustomRequest) {
    const userId = req.user.id;
    const result = await this.addressService.getAllAddressesForUser({ userId });

    return {
      message: 'Successfully fetched all addresses',
      result,
    };
  }

  @Get(':addressId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get address by id' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched address',
  })
  @ApiBody({ type: GetAddressByIdDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async getAddressById(@Param() getAddressByIdDto: GetAddressByIdDto) {
    const result = await this.addressService.getAddressById(getAddressByIdDto);

    return {
      message: 'Successfully fetched address',
      result,
    };
  }

  @Put(':addressId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated address',
  })
  @ApiBody({ type: UpdateAddressDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Param() getAddressByIdDto: GetAddressByIdDto,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const result = await this.addressService.updateAddress(
      getAddressByIdDto,
      updateAddressDto,
    );

    return {
      message: 'Successfully updated address',
      result,
    };
  }

  @Delete(':addressId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted address',
  })
  @ApiBody({ type: DeleteAddressDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async deleteAddress(@Param() deleteAddressDto: DeleteAddressDto) {
    const result = await this.addressService.deleteAddress(deleteAddressDto);

    return {
      message: 'Successfully deleted address',
      result,
    };
  }
}
