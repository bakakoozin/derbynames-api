import type { ExportedHandlerType } from '../utils';

type EmailOpts = {
    to: {
        email: string;
        name: string;
    }[];
    subject: string;
    from? : string;
    html: string;
    env: ExportedHandlerType
};

export async function sendEmail(opts:EmailOpts) {
  const { env , from = "Derby Name" , to, subject, html } = opts;

  return  await fetch(env.EMAIL_API_URL,{
            method:'POST',
            headers:{
              'accept':'application/json',
              'api-key':env.EMAIL_API_KEY
            },
            body:JSON.stringify({
              sender:{
                name:from,
                email:env.EMAIL_API_FROM
              },
              to,
              subject,
              htmlContent: html
          })})
}