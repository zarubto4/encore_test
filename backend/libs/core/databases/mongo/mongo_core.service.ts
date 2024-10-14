import { Collection, CollectionOptions, Db, MongoClient } from "mongodb";
import { Document } from "bson";

/**
 * Raw connection to Mongo.
 * urlWithSecrets in format "mongodb+srv://doadmin: xxxyyyyzzzz /admin?tls=true&authSource=admin"
 * Database - if databaseName is missing in
 */
export class MongoCoreService {
  private mongoDatabase: Db | null = null;

  constructor(protected urlWithSecrets: string, protected databaseName: string) {}

  public async connect(): Promise<MongoCoreService> {
    const dealSchemaManager_mongoClient = new MongoClient(this.urlWithSecrets);
    await dealSchemaManager_mongoClient.connect();
    this.mongoDatabase = dealSchemaManager_mongoClient.db(this.databaseName);
    return this;
  }

  get db(): Db {
    if (this.mongoDatabase == null) {
      throw new Error("Not Connected to MongoDB");
    }
    return this.mongoDatabase;
  }

  collection(collectionName: string, options?: CollectionOptions): Collection<Document> {
    if (this.mongoDatabase == null) {
      throw new Error("Not Connected to MongoDB");
    }
    return this.mongoDatabase.collection(collectionName, options);
  }
}
