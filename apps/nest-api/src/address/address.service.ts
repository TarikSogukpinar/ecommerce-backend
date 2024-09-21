import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { CreateAddressDto } from './dto/requests/createAddress.dto';
import { GetAllAddressesForUserDto } from './dto/requests/getAllAddressesForUser.dto';
import { NoAddressesFoundForUserException } from 'src/core/handler/expcetions/custom-expection';
import { GetAddressByIdDto } from './dto/requests/getAddressById.dto';
import { GetAddressByIdResponseDto } from './dto/responses/getAddressByIdResponse.dto';
import { UpdateAddressDto } from './dto/requests/updateAddress.dto';
import { CreateAddressResponseDto } from './dto/responses/createAddressResponse.dto';
import { UpdateAddressResponseDto } from './dto/responses/updateAddressResponse.dto';
import { DeleteAddressDto } from './dto/requests/deleteAddress.dto';
import { DeleteAddressResponseDto } from './dto/responses/deleteAddressResponse.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAddress(
    createAddressDto: CreateAddressDto,
    userId: string,
  ): Promise<CreateAddressResponseDto> {
    const { addressLine, city, state, country, postalCode } = createAddressDto;
    try {
      const newAddress = await this.prismaService.address.create({
        data: {
          addressLine,
          city,
          state,
          country,
          postalCode,
          user: {
            connect: { id: userId },
          },
        },
        
      });

      const response: CreateAddressResponseDto = {
        addressLine: newAddress.addressLine,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
      };

      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async getAllAddressesForUser(
    getAllAddressesForUserDto: GetAllAddressesForUserDto,
  ): Promise<GetAllAddressesForUserDto[]> {
    try {
      const getAllAddressesForUser = await this.prismaService.address.findMany({
        where: { userId: getAllAddressesForUserDto.userId },
        select: {
          userId: true,
          addressLine: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
        },
        
      });

      if (getAllAddressesForUser.length === 0)
        throw new NoAddressesFoundForUserException();

      return getAllAddressesForUser;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while fetching addresses',
      );
    }
  }

  async getAddressById(
    getAddressByIdDto: GetAddressByIdDto,
  ): Promise<GetAddressByIdResponseDto> {
    try {
      const getAddressById = await this.prismaService.address.findFirst({
        where: {
          id: getAddressByIdDto.addressId,
          userId: getAddressByIdDto.userId,
        },
        select: {
          userId: true,
          addressLine: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
        },
      });

      if (!getAddressById) throw new NoAddressesFoundForUserException();

      return getAddressById;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while fetching the address',
      );
    }
  }

  async updateAddress(
    getAddressByIdDto: GetAddressByIdDto,
    updateAddressDto: UpdateAddressDto,
  ): Promise<UpdateAddressResponseDto> {
    try {
      const updatedAddress = await this.prismaService.address.update({
        where: {
          id: getAddressByIdDto.addressId,
          userId: getAddressByIdDto.userId,
        },
        data: updateAddressDto,
      });

      const response: UpdateAddressResponseDto = {
        addressLine: updatedAddress.addressLine,
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postalCode,
        country: updatedAddress.country,
      };

      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while updating the address',
      );
    }
  }

  async deleteAddress(
    deleteAddressDto: DeleteAddressDto,
  ): Promise<DeleteAddressResponseDto> {
    try {
      const deletedAddress = await this.prismaService.address.deleteMany({
        where: {
          id: deleteAddressDto.addressId,
          userId: deleteAddressDto.userId,
        },
      });

      if (deletedAddress.count === 0)
        throw new NoAddressesFoundForUserException();

      return { message: 'Address deleted successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while deleting the address',
      );
    }
  }
}
