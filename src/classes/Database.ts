// noinspection JSUnusedGlobalSymbols

import * as os from "os";
import {Db, MongoClient, Collection, Document, InsertOneResult, InsertManyResult, WithId} from "mongodb";

// TODO - get from ENV
// const dbUser = "flirtable";
// const dbPassword = "fla11ppGHM!99";
// const dbDatabase = "flirtable";

const dbUser = "flirtable";
const dbPassword = "fla11ppGHM!99";
const dbDatabase = "flirtable"; // Use the correct database

const dbNetwork = os.platform() === "win32" ? "localhost" : "flirtable-mongo";  // Actually the container name

//const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}`;
const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}?authSource=admin`;
console.log(`uri: ${uri}`);


class Database {
  private database: Db = null as unknown as Db;

  private dbClient: MongoClient;

  constructor() {
    this.dbClient = new MongoClient(uri);
  }

  public async connect(): Promise<void> {
    try {
      await this.dbClient.connect();
      this.database = this.dbClient.db();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }

  public async dropCollection(collectionName: string): Promise<boolean> {
    return this.database.dropCollection(collectionName);
  }

  public async createCollection(collectionName: string): Promise<Collection> {
    return this.database.createCollection(collectionName);
  }

  public async insertOne(collectionName: string, data: any): Promise<InsertOneResult> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.insertOne(data);
  }

  public async insertMany(collectionName: string, data: any): Promise<InsertManyResult> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.insertMany(data);
  }

  public async readOne(collectionName: string, query: any): Promise<null | Document> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.findOne(query);
  }

  public async readMany(collectionName: string, query: any): Promise<WithId<Document>[]> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.find(query).toArray();
  }

  public async updateOne(collectionName: string, query: any, update: any): Promise<any> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.updateOne(query, update);
  }

  public async updateMany(collectionName: string, query: any, update: any): Promise<any> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.updateMany(query, update);
  }

  public async deleteOne(collectionName: string, query: any): Promise<any> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.deleteOne(query);
  }

  public async deleteMany(collectionName: string, query: any): Promise<any> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.deleteMany(query);
  }

  async close(): Promise<void> {
    console.log("closed");
  }

  async findOneAndUpdate(collectionName: string, query: any, update: any): Promise<any> {
    const collection: Collection = this.database.collection(collectionName);
    return collection.findOneAndUpdate(query, update);
  }

  use(databaseName: string): void {
    this.database = this.dbClient.db(databaseName);
  }
}

const db: Database = new Database();
export {db, Database};
