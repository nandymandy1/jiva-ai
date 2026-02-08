import type { BaseDataResponse } from '@/common/types/base-response.types';

export type OllamaModelDetails = {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
};

export type OllamaModel = {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
};

export type OllamaTagsResponse = {
  models: OllamaModel[];
};

export type AnalyseMedicinesResponse = BaseDataResponse<{ jobId: string }>;
