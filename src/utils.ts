// ===== TYPES ================================================================
export interface ExportedHandlerType {
  EMAIL_API_KEY: string
  EMAIL_API_URL: string
  EMAIL_API_FROM: string
  DB_NAME: string
  JWT_SECRET: string
  derbyname: {
    put: (key:string,data: string) => Promise<string>
    get: (query: string) => Promise<string>
    list: () => Promise<string[]>
    delete: (query: string) => Promise<string>
  } 
}


export type Router = Record<string, Record<string, (req: Request, env: ExportedHandlerType) => Promise<Response>>>;
// ===== CONST  ================================================================


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

export function toOptions(): Response {
  return new Response(null, { headers: corsHeaders });
}

export function toError(error: string | unknown, status = 400): Response {
  return toJSON({ error }, status);
}

export function reply(output: unknown): Response {
  if (output != null) return toJSON(output, 200);
  return toError('Error with query', 500);
}