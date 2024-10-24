import { api, APIError, ErrCode } from "encore.dev/api";
import { DealTypeService } from "../services/dealType.service";
import { DefaultResponses, DefaultResponsesI } from "../../../../libs/core/default_responses/responses.models";
import {
  DealTypeCreateRequest,
  DealTypeCreateRequestValidator,
  DealTypeFilterRequest,
  DealTypeFilterRequestValidator,
  DealTypeFilterResponse,
  DealTypeGetRequest,
  DealTypeRemoveRequest,
  DealTypeRemoveRequestValidator,
  DealTypeResponse,
  DealTypeUpdateRequest,
  DealTypeUpdateRequestValidator,
} from "../models/dealType.models";
import { rbacRequiredUserSignature } from "../utils/utils";
import {
  dealSchemaManager_rbac_type_Create,
  dealSchemaManager_rbac_type_Get,
  dealSchemaManager_rbac_type_Remove,
  dealSchemaManager_rbac_type_Update,
} from "../encore.service";

// Service -------------------------------------------------------------------------------------------------------------
const dealTypeService = new DealTypeService();

// Apis ----------------------------------------------------------------------------------------------------------------

/**
 * Create new Deal Type
 */
export const dealTypeCreate = api(
  { expose: true, auth: true, method: "POST", path: "/deal_schema_management/type" },
  async (params: DealTypeCreateRequest): Promise<DealTypeResponse> => {
    // Valid incoming object
    const validObject = DealTypeCreateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Create, null);

    // Return response
    return await dealTypeService.createNewDealType(validObject);
  },
);

/**
 * Update Deal Type
 */
export const dealTypeUpdate = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/type" },
  async (params: DealTypeUpdateRequest): Promise<DealTypeResponse> => {
    // Valid incoming object
    const validObject = DealTypeUpdateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Update, validObject.id);

    // Return response
    return await dealTypeService.updateDealType(validObject);
  },
);

/**
 * Get Deal Type by ID or eventually by another variable
 */
export const dealTypeGet = api(
  { expose: true, auth: true, method: "GET", path: "/deal_schema_management/type" },
  async (params: DealTypeGetRequest): Promise<DealTypeResponse> => {
    // Valid incoming object
    const validObject = DealTypeUpdateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Get, validObject.id);

    // Return response
    return await dealTypeService.getDealType(validObject);
  },
);

/**
 * Get Deal Types as List with filtering
 */
export const dealTypeGetList = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/types" },
  async (params: DealTypeFilterRequest): Promise<DealTypeFilterResponse> => {
    // Valid incoming object
    const validObject = DealTypeFilterRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Get, null);

    // Return response
    return await dealTypeService.getDealTypeFilter(validObject);
  },
);

/**
 * Remove Deal Type
 */
export const dealTypeRemove = api(
  { expose: true, auth: true, method: "DELETE", path: "/deal_schema_management/type" },
  async (params: DealTypeRemoveRequest): Promise<DefaultResponsesI> => {
    // Valid incoming object
    const validObject = DealTypeRemoveRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Remove, validObject.id);

    // Execution
    await dealTypeService.removeDealType(validObject);

    // Return response
    return new DefaultResponses();
  },
);
