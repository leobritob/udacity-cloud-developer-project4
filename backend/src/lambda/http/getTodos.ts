import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils'
import { getTodo } from '../../businessLogic/todologic'

export const handler: APIGatewayProxyHandler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const items = await getTodo(userId)

    try {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Orgin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ items }),
      }
    } catch (e) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ e }),
      }
    }
  }
).use(cors({ credentials: true }))
