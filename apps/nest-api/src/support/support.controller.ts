import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/requests/createTicket.dto';
import { CustomRequest } from 'src/core/request/customRequest';
import { InvalidCredentialsException } from 'src/core/handler/expcetions/custom-expection';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { GetMyTicketsDto } from './dto/requests/getMyTickets.dto';
import { GetTicketDetailsParamsDto } from './dto/requests/getTicketDetailsParams.dto';

@Controller({ path: 'support', version: '1' })
@ApiTags('Support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('createSupportTicket')
  @ApiOperation({ summary: 'Create support ticket' })
  @ApiResponse({
    status: 200,
    description: 'Support ticket created',
  })
  @ApiBody({ type: String })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createSupportTicket(
    @Body() createTicketDto: CreateTicketDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.supportService.createTicket(
      createTicketDto,
      userId,
    );
    return {
      message: 'Support ticket created successfully!',
      result,
    };
  }

  @Get('getMyTickets')
  @ApiOperation({ summary: 'Get my tickets' })
  @ApiResponse({
    status: 200,
    description: 'Get my tickets',
  })
  @ApiBody({ type: String })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyTickets(
    @Query() query: GetMyTicketsDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.supportService.getMyTickets(userId, query);

    return {
      message: 'Successfully fetched all tickets',
      result,
    };
  }

  @Get('getTicketDetails/:ticketId/user/:userId')
  @ApiOperation({ summary: 'Get ticket details' })
  @ApiResponse({
    status: 200,
    description: 'Get ticket details',
  })
  @ApiBody({ type: String })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getTicketDetails(
    @Param() getTicketDetailsParamsDto: GetTicketDetailsParamsDto,
  ) {
    const result = await this.supportService.getTicketDetails(
      getTicketDetailsParamsDto,
    );
    return {
      message: 'Successfully fetched ticket details',
      result,
    };
  }
}
