import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { CreateAddressDto } from './dto/requests/createAddress.dto';
import { GetAllAddressesForUserDto } from './dto/requests/getAllAddressesForUser.dto';
import { NoAddressesFoundForUserException } from 'src/core/handler/expcetions/custom-expection';
import { GetAddressByIdDto } from './dto/requests/getAddressById.dto';
import { GetAddressByIdResponseDto } from './dto/responses/getAddressByIdResponse.dto';
import { UpdateAddressDto } from './dto/requests/updateAddress.dto';
import { CreateAddressResponseDto } from './dto/responses/createAddressResponse.dto';

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
  ): Promise<CreateAddressResponseDto[]> {
    try {
      const addresses = await this.prismaService.address.findMany({
        where: { userId: getAllAddressesForUserDto.userId },
      });

      if (addresses.length === 0) throw new NoAddressesFoundForUserException();

      return addresses;
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
      const address = await this.prismaService.address.findFirst({
        where: {
          id: getAddressByIdDto.addressId,
          userId: getAddressByIdDto.userId,
        },
      });

      if (!address) throw new NoAddressesFoundForUserException();

      return address;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while fetching the address',
      );
    }
  }

  //check this method
  async updateAddress(
    getAddressByIdDto: GetAddressByIdDto,
    updateAddressDto: UpdateAddressDto,
  ): Promise<any> {
    try {
      const updatedAddress = await this.prismaService.address.updateMany({
        where: {
          id: getAddressByIdDto.userId,
          userId: getAddressByIdDto.addressId,
        },
        data: updateAddressDto,
      });

      if (updatedAddress.count === 0)
        throw new NoAddressesFoundForUserException();

      return updatedAddress;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while updating the address',
      );
    }
  }

  async deleteAddress(addressId: string, userId: string) {
    try {
      const deletedAddress = await this.prismaService.address.deleteMany({
        where: { id: addressId, userId },
      });

      if (!deletedAddress.count) {
        throw new Error('Address not found or access denied');
      }

      return { message: 'Address deleted successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while deleting the address',
      );
    }
  }
}
