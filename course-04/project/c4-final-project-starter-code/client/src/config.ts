// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'heu2j6oxna'
const region = 'eu-west-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-75ascs57.eu.auth0.com',            // Auth0 domain
  clientId: 'p0Sg3xMW56Vy7D9FnznPxJ4TdbRJMjmw',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
