import { api } from "encore.dev/api";
import { DealTypeService } from "../services/dealType.service";
import { currentRequest } from "encore.dev";
import { DefaultResponses, DefaultResponsesI } from "../../../../libs/core/default_responses/responses.models";
import {
  DealTypeCreateRequest,
  DealTypeFilterRequest,
  DealTypeFilterResponse,
  DealTypeGetRequest,
  DealTypeRemoveRequest,
  DealTypeResponse,
  DealTypeUpdateRequest,
} from "../models/dealType.models";

// Service -------------------------------------------------------------------------------------------------------------
const dealTypeService = new DealTypeService();

/**
 * Create new Deal Type
 */
export const dealTypeCreate = api(
  { expose: true, auth: true, method: "POST", path: "/deal_schema_management/type" },
  async (params: DealTypeCreateRequest): Promise<DealTypeResponse> => {
    return await dealTypeService.createNewDealType(params, currentRequest());
  },
);

/**
 * Update Deal Type
 */
export const dealTypeUpdate = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/type" },
  async (params: DealTypeUpdateRequest): Promise<DealTypeResponse> => {
    const response = await dealTypeService.updateDealType(params, currentRequest());
    return response;
  },
);

/**
 * Get Deal Type by ID or eventually by another variable
 */
export const dealTypeGet = api(
  { expose: true, auth: true, method: "GET", path: "/deal_schema_management/type" },
  async (params: DealTypeGetRequest): Promise<DealTypeResponse> => {
    return await dealTypeService.getDealType(params, currentRequest());
  },
);

/**
 * Get Deal Types as List with filtering
 */
export const dealTypeGetList = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/types" },
  async (params: DealTypeFilterRequest): Promise<DealTypeFilterResponse> => {
    const response = await dealTypeService.getDealTypeFilter(params, currentRequest());
    return response;
  },
);

/**
 * Remove Deal Type
 */
export const dealTypeRemove = api(
  { expose: true, auth: true, method: "DELETE", path: "/deal_schema_management/type" },
  async (params: DealTypeRemoveRequest): Promise<DefaultResponsesI> => {
    await dealTypeService.removeDealType(params, currentRequest());
    return new DefaultResponses();
  },
);
