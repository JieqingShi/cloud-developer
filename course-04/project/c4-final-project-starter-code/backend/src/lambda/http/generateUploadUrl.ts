import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrlLogger')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const uploadUrl = await createAttachmentPresignedUrl(todoId, userId)
    logger.info(`Generated presigned url ${ uploadUrl } for user ${ userId } with todo ${ todoId }`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl  // the key has to be = "uploadUrl" because it's set so in the frontend!! (check todos-api.ts in client/src/api)
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
