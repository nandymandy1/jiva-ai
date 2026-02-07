import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LlmService } from './llm.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { BaseDataResponse } from '@/common/types/base-response.types';

@ApiTags('LLM')
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate text using LLM' })
  @ApiResponse({
    status: 202,
    description: 'Generation request queued successfully.',
  })
  async generate(
    @Body() createGenerationDto: CreateGenerationDto,
  ): Promise<BaseDataResponse<{ jobId: string }>> {
    return this.llmService.generate(createGenerationDto);
  }
}
