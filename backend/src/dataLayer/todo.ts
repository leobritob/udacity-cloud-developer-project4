import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
const AWSXRay = require('aws-xray-sdk')

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const xRay = AWSXRay.captureAWS(AWS)

export class Todo {
  constructor(
    private readonly docClient: AWS.DynamoDB.DocumentClient = new xRay.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly Index = process.env.INDEX_NAME
  ) {}

  async getTodo(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todoTable,
        IndexName: this.Index,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId: string = uuid.v4()
    let item: TodoItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      name: request.name,
      dueDate: request.dueDate,
      done: false,
    }

    await this.docClient.put({ TableName: this.todoTable, Item: item }).promise()

    return item
  }

  async updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest) {
    await this.docClient
      .update({
        TableName: this.todoTable,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression: 'set #Date = :du, #name = :n, #done = :do',
        ExpressionAttributeNames: {
          '#Date': 'dueDate',
          '#name': 'name',
          '#done': 'done',
        },
        ExpressionAttributeValues: {
          ':du': updateTodo.dueDate,
          ':n': updateTodo.name,
          ':do': updateTodo.done,
        },
      })
      .promise()
  }

  async deleteTodo(userId: string, todoId: string) {
    await this.docClient
      .delete({
        TableName: this.todoTable,
        Key: { userId, todoId },
      })
      .promise()
  }
}
