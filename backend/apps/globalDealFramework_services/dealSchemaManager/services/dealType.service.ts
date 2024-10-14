import {
  dealSchemaManager_mongoCollection_DealSchema,
  dealSchemaManager_rbac_type_Create,
  dealSchemaManager_rbac_type_Get,
  dealSchemaManager_rbac_type_Remove,
  dealSchemaManager_rbac_type_Update,
} from "../encore.service";
import { APIError, ErrCode } from "encore.dev/api";
import { ObjectId } from "mongodb";
import { dealTypeConvertFromEntity, DealTypeDTO, DealTypeEntity } from "../models/dealType.orm";
import {
  DealTypeCreateRequest,
  DealTypeCreateRequestValidator,
  DealTypeFilterRequest,
  DealTypeFilterResponse,
  DealTypeGetRequest,
  DealTypeGetRequestValidator,
  DealTypeRemoveRequest,
  DealTypeResponse,
  DealTypeResponseClass,
  DealTypeUpdateRequest,
  DealTypeUpdateRequestValidator,
} from "../models/dealType.models";
import { DealTemplateFilterRequestValidator } from "../models/dealTemplate.models";
import { rbacRequiredUserSignature } from "../utils/utils";

export class DealTypeService {
  /**
   * Create new Deal Type with Validator
   * @param params
   */
  public async createNewDealType(params: DealTypeCreateRequest): Promise<DealTypeResponse> {
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Create, null);
    const response = await this._create(DealTypeCreateRequestValidator.parse(params));
    return new DealTypeResponseClass(response);
  }

  /**
   * Update Deal Type with Validator by ID
   * @param params
   */
  public async updateDealType(params: DealTypeUpdateRequest): Promise<DealTypeResponse> {
    const validObject = DealTypeUpdateRequestValidator.parse(params);
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Update, validObject.id);
    const response = await this._update(validObject);
    return new DealTypeResponseClass(response);
  }

  /**
   * Get Deal Type by ID
   * @param params
   */
  public async getDealType(params: DealTypeGetRequest): Promise<DealTypeResponse> {
    const validObject = DealTypeUpdateRequestValidator.parse(params);
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Get, validObject.id);
    const response = await this._find(validObject);
    if (response) {
      return new DealTypeResponseClass(response);
    } else throw new APIError(ErrCode.NotFound, "sprocket not found");
  }

  /**
   * Get Deal Types as List with filtering
   * @param params
   */
  public async getDealTypeFilter(params: DealTypeFilterRequest): Promise<DealTypeFilterResponse> {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validObject = DealTemplateFilterRequestValidator.parse(params);
    if (await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Get, null, false)) {
      // TODO
    } else {
      // TODO
    }
    // @ts-expect-error @ts-ignore
    return null;
  }

  /**
   * Remove Deal Type by ID
   * @param params
   */
  public async removeDealType(params: DealTypeRemoveRequest): Promise<void> {
    const validObject = DealTypeGetRequestValidator.parse(params);
    await rbacRequiredUserSignature(dealSchemaManager_rbac_type_Remove, validObject.id);
    const response = await this._find(validObject);
    if (response) {
      await dealSchemaManager_mongoCollection_DealSchema.deleteOne({ _id: validObject.id });
    } else throw new APIError(ErrCode.NotFound, "sprocket not found");
  }

  // - Private ---------------------------------------------------------------------------------------------------------

  private async _find(dto: DealTypeGetRequestValidator): Promise<DealTypeDTO> {
    const entity = await dealSchemaManager_mongoCollection_DealSchema.findOne({ _id: new ObjectId(dto.id) });
    if (entity) {
      return dealTypeConvertFromEntity(entity as DealTypeEntity);
    } else throw new APIError(ErrCode.NotFound, "sprocket not found");
  }

  private async _update(dto: DealTypeUpdateRequestValidator): Promise<DealTypeDTO> {
    const entity = await dealSchemaManager_mongoCollection_DealSchema.findOne({ _id: new ObjectId(dto.id) });
    if (entity) {
      await dealSchemaManager_mongoCollection_DealSchema.replaceOne({ _id: new ObjectId(dto.id) }, dto);
      return await this._find(DealTypeGetRequestValidator.parse({ id: dto.id }));
    } else {
      throw new APIError(ErrCode.NotFound, "sprocket not found");
    }
  }

  private async _create(dto: DealTypeCreateRequestValidator): Promise<DealTypeDTO> {
    const { insertedId } = await dealSchemaManager_mongoCollection_DealSchema.insertOne(dto);
    return dealTypeConvertFromEntity({ ...dto, _id: insertedId });
  }
}
