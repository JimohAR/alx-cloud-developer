import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const auth = event.headers.Authorization
    const JWT = auth.split(' ')[1]

    const todos = getAllTodo(JWT)

    return {
      statusCode: 200,
      body: JSON.stringify({
        "items": todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
