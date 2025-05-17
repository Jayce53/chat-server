/**
 * Get the next id for either a user or a conversation
 */

import {db} from "@/classes/Database";

interface IdDocument {
  _id: string;
  id: number;
}

export async function getNextId(type: "user" | "conversation"): Promise<number> {
  const document: IdDocument = await (db.findOneAndUpdate("id", {_id : type}, {$inc : {id : 1}})) as IdDocument;
  return document.id;
}
