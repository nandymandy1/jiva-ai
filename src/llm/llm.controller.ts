import { Body, Controller, Post, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LlmService } from './llm.service';
import { AnalyseMedicinesDto } from './dto/analyse-medicines.dto';
import type { BaseDataResponse } from '@/common/types/base-response.types';

@ApiTags('LLM')
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('analyse-medicines')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Analyse medicines',
  })
  @ApiResponse({
    status: 202,
    description: 'Analyse medicines request queued successfully.',
  })
  async analyseMedicines(
    @Request() req: Request,
    @Body() analyseMedicinesDto: AnalyseMedicinesDto,
  ): Promise<BaseDataResponse<{ aiJobId: string }>> {
    return this.llmService.analyseMedicines(analyseMedicinesDto);
  }
}
