import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger';

const logger = createLogger('dataLayer')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    const todos = await getTodosForUser(userId)
    logger.info(`Returning ${todos.length} todos`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        "items": todos
      })
    }
  }
)

handler
  .use(
    cors({
      credentials: true
    })
  )
