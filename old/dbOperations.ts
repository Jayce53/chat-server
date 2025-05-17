import {WithId, Document, Collection, UpdateOptions} from "mongodb";
import {db} from "./mongodb";

interface Query {
  [key: string]: any;
}

async function dbRead(collectionName: string, query: Query): Promise<WithId<Document>[]> {
  const collection: Collection<Document> = db.collection(collectionName);
  return collection.find(query).toArray();
}

async function dbReadOne(collectionName: string, query: Query): Promise<WithId<Document> | null> {
  const collection: Collection<Document> = db.collection(collectionName);
  return collection.findOne(query);
}

async function dbInsert(collectionName: string, data: Document): Promise<void> {
  const collection: Collection<Document> = db.collection(collectionName);
  await collection.insertOne(data);
}

async function dbUpdate(collectionName: string, query: Query, update: any): Promise<void> {
  const collection: Collection<Document> = db.collection(collectionName);
  await collection.updateMany(query, update);
}

async function dbUpdateOne(collectionName: string, query: Query, update: any): Promise<void> {
  const collection: Collection<Document> = db.collection(collectionName);
  await collection.updateOne(query, update);
}

async function dbFindOneAndUpdate(collectionName: string, query: Query, update: any, options?: UpdateOptions): Promise<Document> {
  const collection: Collection<Document> = db.collection(collectionName);
  return collection.updateOne(query, update, options);
}

async function dbDelete(collectionName: string, query: Query): Promise<void> {
  const collection: Collection<Document> = db.collection(collectionName);
  await collection.deleteMany(query);
}

export {dbRead, dbReadOne, dbInsert, dbUpdate, dbUpdateOne, dbDelete, dbFindOneAndUpdate};

