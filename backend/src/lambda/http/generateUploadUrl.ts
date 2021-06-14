import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

import { getUserId } from '../utils'

const TableName = process.env.TODOS_TABLE
const Bucket = process.env.UPLOAD_S3_BUCKET

const docClient = new AWS.DynamoDB.DocumentClient()

const s3 = new AWS.S3({ signatureVersion: 'v4' })

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()
  const userId = getUserId(event)

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket,
    Key: imageId,
    Expires: 300,
  })

  const imageUrl = `https://${Bucket}.s3.amazonaws.com/${imageId}`

  await docClient
    .update({
      TableName,
      Key: { todoId, userId },
      UpdateExpression: 'set attachmentUrl = :objecturl',
      ExpressionAttributeValues: {
        ':objecturl': imageUrl,
      },
    })
    .promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ imageUrl, uploadUrl }),
  }
}
