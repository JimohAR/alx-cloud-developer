import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('dataLayer')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)

    if (newTodo["name"].length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          "error": "No name Provided"
        })
      }
    }
    try {
      var todo = await createTodo(newTodo, userId)
    } catch (err) {
      logger.error("failed to create todo", err)
      return {
        statusCode: 400,
        body: JSON.stringify({
          "error": "failed to create todo"
        })
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        "item": todo
      }),
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
