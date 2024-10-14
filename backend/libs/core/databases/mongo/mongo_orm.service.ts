import * as mongoose from "mongoose";
import { Connection } from "mongoose";

export class MongoOrmService {
  private mongoDatabase: Connection | null = null;

  constructor(protected urlWithSecrets: string, protected databaseName: string) {}

  public async connect(): Promise<MongoOrmService> {
    this.mongoDatabase = await mongoose.createConnection(this.urlWithSecrets, { dbName: this.databaseName });
    return this;
  }

  get db(): Connection {
    if (this.mongoDatabase == null) {
      throw new Error("Not Connected to MongoDB");
    }
    return this.mongoDatabase;
  }
}
