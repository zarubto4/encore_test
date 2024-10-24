import { dealSchemaManager_mongoCollection_DealSchema } from "../encore.service";
import { APIError, ErrCode } from "encore.dev/api";
import { ObjectId } from "mongodb";
import { dealTypeConvertFromEntity, DealTypeDTO, DealTypeEntity } from "../models/dealType.orm";
import {
  DealTypeCreateRequestValidator,
  DealTypeFilterRequestValidator,
  DealTypeFilterResponse,
  DealTypeGetRequestValidator,
  DealTypeRemoveRequestValidator,
  DealTypeResponse,
  DealTypeResponseClass,
  DealTypeUpdateRequestValidator,
} from "../models/dealType.models";

export class DealTypeService {
  /**
   * Create new Deal Type with Validator
   * @param params
   */
  public async createNewDealType(params: DealTypeCreateRequestValidator): Promise<DealTypeResponse> {
    const response = await this._create(params);
    return new DealTypeResponseClass(response);
  }

  /**
   * Update Deal Type with Validator by ID
   * @param params
   */
  public async updateDealType(params: DealTypeUpdateRequestValidator): Promise<DealTypeResponse> {
    const response = await this._update(params);
    return new DealTypeResponseClass(response);
  }

  /**
   * Get Deal Type by ID
   * @param params
   */
  public async getDealType(params: DealTypeGetRequestValidator): Promise<DealTypeResponse> {
    const response = await this._find(params);
    if (response) {
      return new DealTypeResponseClass(response);
    } else throw new APIError(ErrCode.NotFound, "sprocket not found");
  }

  /**
   * Get Deal Types as List with filtering
   * @param params
   */
  public async getDealTypeFilter(params: DealTypeFilterRequestValidator): Promise<DealTypeFilterResponse> {
    const query = {};
    return {
      list: (await dealSchemaManager_mongoCollection_DealSchema.find(query).toArray()).map(
        (e) => new DealTypeResponseClass(dealTypeConvertFromEntity(e as DealTypeEntity)),
      ),
    };
  }

  /**
   * Remove Deal Type by ID
   * @param params
   */
  public async removeDealType(params: DealTypeRemoveRequestValidator): Promise<void> {
    const response = await this._find(params);
    if (response) {
      await dealSchemaManager_mongoCollection_DealSchema.deleteOne({ _id: new ObjectId(params.id) });
    } else throw new APIError(ErrCode.NotFound, "sprocket not found");
  }

  // - Private ---------------------------------------------------------------------------------------------------------

  private async _find(dto: DealTypeGetRequestValidator): Promise<DealTypeDTO> {
    const entity = await dealSchemaManager_mongoCollection_DealSchema.findOne({ _id: new ObjectId(dto.id) });
    if (entity) {
      return dealTypeConvertFromEntity(entity as DealTypeEntity);
    } else throw new APIError(ErrCode.NotFound, "sprocket not found");
  }

  private async _create(dto: DealTypeCreateRequestValidator): Promise<DealTypeDTO> {
    const { insertedId } = await dealSchemaManager_mongoCollection_DealSchema.insertOne(dto);
    return dealTypeConvertFromEntity({ ...dto, _id: insertedId });
  }

  private async _update(dto: DealTypeUpdateRequestValidator): Promise<DealTypeDTO> {
    const entity = await dealSchemaManager_mongoCollection_DealSchema.findOne({ _id: new ObjectId(dto.id) });
    if (entity) {
      await dealSchemaManager_mongoCollection_DealSchema.replaceOne({ _id: new ObjectId(dto.id) }, dto);
      return await this._find(dto);
    } else {
      throw new APIError(ErrCode.NotFound, "sprocket not found");
    }
  }
}
