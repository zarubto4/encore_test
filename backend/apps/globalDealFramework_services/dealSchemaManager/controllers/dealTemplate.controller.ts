import { api } from "encore.dev/api";
import { currentRequest } from "encore.dev";
import { DealTemplateService } from "../services/dealTemplate.service";
import {
  DealTemplateCreateRequest,
  DealTemplateResponse,
  DealTemplateGetRequest,
  DealTemplateRemoveRequest,
  DealTemplateUpdateRequest,
  DealTemplateFilterResponse,
  DealTemplateFilterRequest,
} from "../models/dealTemplate.models";
import { DefaultResponses, DefaultResponsesI } from "../../../../libs/core/default_responses/responses.models";

// Services ------------------------------------------------------------------------------------------------------------
const dealTemplateService = new DealTemplateService();

// Apis ----------------------------------------------------------------------------------------------------------------

/**
 * Create new Deal Template
 */
export const dealTemplateCreate = api(
  { expose: true, auth: true, method: "POST", path: "/deal_schema_management/template" },
  async (params: DealTemplateCreateRequest): Promise<DealTemplateResponse> => {
    const result = await dealTemplateService.createNewDealTemplate(params);
    return result;
  },
);

/**
 * Update Deal Template
 */
export const dealTemplateUpdate = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/template" },
  async (params: DealTemplateUpdateRequest): Promise<DealTemplateResponse> => {
    const response = await dealTemplateService.updateDealTemplate(params);
    return response;
  },
);

/**
 * Get Deal Template
 */
export const dealTemplateGet = api(
  { expose: true, auth: true, method: "GET", path: "/deal_schema_management/template" },
  async (params: DealTemplateGetRequest): Promise<DealTemplateResponse> => {
    return await dealTemplateService.getDealTemplate(params);
  },
);

/**
 * Get Deal Template by ID or eventually by another variable
 */
export const dealTemplateGetList = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/templates" },
  async (params: DealTemplateFilterRequest): Promise<DealTemplateFilterResponse> => {
    const response = await dealTemplateService.getDealTemplateFilter(params);
    return response;
  },
);

/**
 * Remove Deal Template
 */
export const dealTemplateRemove = api(
  { expose: true, auth: true, method: "DELETE", path: "/deal_schema_management/template" },
  async (params: DealTemplateRemoveRequest): Promise<DefaultResponsesI> => {
    await dealTemplateService.removeDealTemplate(params);
    return new DefaultResponses();
  },
);
