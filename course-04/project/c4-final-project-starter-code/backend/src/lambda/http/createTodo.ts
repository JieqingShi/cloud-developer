import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos';
import { createLogger} from '../../utils/logger'

const logger = createLogger("createTodoLogger")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Creating a new todo event", event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const item = await createTodo(newTodo, userId)
    logger.info("Created a new todo item", item)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item  // the key has to be ="item" because it's set so in the frontend!! (check todos-api.ts in client/src/api)
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
