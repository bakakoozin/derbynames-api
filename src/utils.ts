import * as Realm from 'realm-web';



// ===== TYPES ================================================================

export type Document = globalThis.Realm.Services.MongoDB.Document;
export const ObjectId = Realm.BSON.ObjectID;

export interface ExportedHandlerType {
  // MongoDB Atlas Application ID
  ATLAS_APPID: string;
  ATLAS_TOKEN: string
  EMAIL_API_KEY: string
  EMAIL_API_URL: string
  EMAIL_API_FROM: string
}

// ===== CONST  ================================================================
export const DB_NAME = "cloudflare"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Max-Age": "86400",
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true'
}

// ===== UTILS ================================================================
export function toJSON(data: unknown, status = 200): Response {
  const body = JSON.stringify(data, null, 2);
  const headers = { 'content-type': 'application/json', ...corsHeaders, "x-derby": "cors" };
  return new Response(body, { headers, status });
}

export function toError(error: string | unknown, status = 400): Response {
  return toJSON({ error }, status);
}

export function reply(output: unknown): Response {
  if (output != null) return toJSON(output, 200);
  return toError('Error with query', 500);
}

export async function getClient(env: ExportedHandlerType, App: Realm.App) {

  try {
    const credentials = Realm.Credentials.apiKey(env.ATLAS_TOKEN);
    // Attempt to authenticate
    const user = await App.logIn(credentials);
    return user.mongoClient('mongodb-atlas');
  } catch (err) {
    console.log(err)
    return undefined;
  }
}