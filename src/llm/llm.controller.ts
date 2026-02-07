import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LlmService } from './llm.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import type { GenerateResponse } from './types/ollama.types';
import { AuthRequest } from '@/common/types/request.types';

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
    @Request() req: AuthRequest,
    @Body() createGenerationDto: CreateGenerationDto,
  ): Promise<GenerateResponse> {
    const requestingClientId = req.user.clientId;
    return this.llmService.generate(createGenerationDto, requestingClientId);
  }
}
