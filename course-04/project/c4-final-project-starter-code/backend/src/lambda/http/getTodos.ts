import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

const logger = createLogger('getTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const items = await getTodosForUser(userId)
    logger.info(`Retrieved todos for user ${userId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items  // the key has to be ="items" because it's set so in the frontend!! (check todos-api.ts in client/src/api)
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
