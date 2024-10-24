import { Service } from "encore.dev/service";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";
import { MongoCoreService } from "../../../libs/core/databases/mongo/mongo_core.service";
import { MongoOrmService } from "../../../libs/core/databases/mongo/mongo_orm.service";
import { secret } from "encore.dev/config";
import { RBACPermissions } from "../../../libs/core/rbac/models";

// ==== SERVICE ========================================================================================================

export const service = new Service("globalDealFrameworkService_dealSchemaManager");
export const grouponServiceDefinition = new GrouponServiceProvider(service, {
  name: "Deal schema manager tooling",
  description: "Deal Type and Deal Schema management",
  contacts: {
    serviceOwnerEmail: "c_tzaruba@groupon.com",
    techLeadEmail: "c_tzaruba@groupon.com",
    productOwnerEmail: "c_tzaruba@groupon.com",
  },
  team: {
    email: "transformation@groupon.com",
    opsgenie: null,
    googleChatSpaceUrl: "www.google.com",
  },
  jiraProject: {
    projectName: "TPMO",
    epicBugBucketName: "TMPO-33",
  },
  documentation: [],
});

// ==== SERVICE SECRETS ================================================================================================

const dealSchemaManager_mongoUrl = secret("mongoDB_centralDatabase");

// ==== AVAILABLE EMITTED TOPICS =======================================================================================
// # none

// ==== SERVICE CONFIG =================================================================================================

const dealSchemaManager_mongoDatabaseName = "dealSchemaManager";
const dealSchemaManager_rawDatabase = await new MongoCoreService(
  dealSchemaManager_mongoUrl(),
  dealSchemaManager_mongoDatabaseName,
).connect();
export const dealSchemaManager_mongoCollection_DealSchema = dealSchemaManager_rawDatabase.collection("deal_schema");

export const dealSchemaManager_ormDatabase = await new MongoOrmService(
  dealSchemaManager_mongoUrl(),
  dealSchemaManager_mongoDatabaseName,
).connect();

// ==== SERVICE STATIC VARIABLES =======================================================================================
// # none

// ==== SERVICE PERMISSIONS ============================================================================================
const rbac_Scope = "DMG";
export const dealSchemaManager_rbac_custom_field_Create = new RBACPermissions(rbac_Scope, "GLOBAL", "CREATE_CUSTOM_FIELD");
export const dealSchemaManager_rbac_custom_field_Update = new RBACPermissions(rbac_Scope, "GLOBAL", "UPDATE_CUSTOM_FIELD");
export const dealSchemaManager_rbac_custom_field_Remove = new RBACPermissions(rbac_Scope, "GLOBAL", "REMOVE_CUSTOM_FIELD");
export const dealSchemaManager_rbac_custom_field_Get = new RBACPermissions(rbac_Scope, "GLOBAL", "GET_CUSTOM_FIELD");
export const dealSchemaManager_rbac_type_Create = new RBACPermissions(rbac_Scope, "GLOBAL", "CREATE_TYPE");
export const dealSchemaManager_rbac_type_Update = new RBACPermissions(rbac_Scope, "GLOBAL", "UPDATE_TYPE");
export const dealSchemaManager_rbac_type_Remove = new RBACPermissions(rbac_Scope, "GLOBAL", "REMOVE_TYPE");
export const dealSchemaManager_rbac_type_Get = new RBACPermissions(rbac_Scope, "GLOBAL", "GET_TYPE");
export const dealSchemaManager_rbac_template_Create = new RBACPermissions(rbac_Scope, "GLOBAL", "CREATE_TEMPLATE");
export const dealSchemaManager_rbac_template_Update = new RBACPermissions(rbac_Scope, "GLOBAL", "UPDATE_TEMPLATE");
export const dealSchemaManager_rbac_template_Remove = new RBACPermissions(rbac_Scope, "GLOBAL", "REMOVE_TEMPLATE");
export const dealSchemaManager_rbac_template_Get = new RBACPermissions(rbac_Scope, "GLOBAL", "GET_TEMPLATE");
