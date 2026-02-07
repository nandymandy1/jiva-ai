import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { BaseDataResponse } from '@/common/types/base-response.types';
import type { AppResponse } from './types/app.types';
import type { AuthRequest } from '@/common/types/request.types';

@ApiTags('Apps')
@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new app' })
  @ApiResponse({
    status: 201,
    description:
      'App registered successfully including clientSecret (shown only once).',
  })
  async register(
    @Body() createAppDto: CreateAppDto,
  ): Promise<BaseDataResponse<AppResponse>> {
    const data = await this.appsService.registerApp(createAppDto);
    return {
      success: true,
      message: 'App registered successfully',
      data,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get app profile (protected)' })
  @ApiResponse({
    status: 200,
    description: 'App profile retrieved successfully.',
  })
  getProfile(@Request() req: AuthRequest): AppResponse {
    return req.user;
  }

  @Post('update/:clientId')
  @ApiOperation({ summary: 'Update app details' })
  async update(
    @Body() updateAppDto: UpdateAppDto,
    @Param('clientId') clientId: string,
  ): Promise<BaseDataResponse<AppResponse>> {
    const data = await this.appsService.updateApp(clientId, updateAppDto);
    if (!data) {
      throw new NotFoundException('App not found');
    }
    return {
      success: true,
      message: 'App updated successfully',
      data,
    };
  }

  @Delete(':clientId')
  @ApiOperation({ summary: 'Delete app' })
  async delete(
    @Param('clientId') clientId: string,
  ): Promise<BaseDataResponse<null>> {
    const deleted = await this.appsService.deleteApp(clientId);
    if (!deleted) {
      throw new NotFoundException('App not found');
    }
    return {
      success: true,
      message: 'App deleted successfully',
      data: null,
    };
  }
}
