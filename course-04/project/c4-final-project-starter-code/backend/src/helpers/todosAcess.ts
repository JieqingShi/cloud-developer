import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
        // private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        // private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}
    
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
    
        return todoItem
    }
    
    async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoItem> {
        const updateExpression = 'SET #name = :name, dueDate = :dueDate, done = :done'
        const expressionAttributeNames = {
        '#name': 'name'
        }
        const expressionAttributeValues = {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
        }
    
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "UPDATED_NEW"
        }).promise()
    
        return await this.getTodoById(todoId, userId)
    }
    
    async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: {
            todoId: todoId,
            userId: userId
        }
        }).promise()
    
        return result.Item as TodoItem
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
    
        const items = result.Items
        return items as TodoItem[]
    }

    async deleteTodo(todoId: string, userId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }).promise()
    }

    async updateAttachmentUrl(todoId: string, userId: string, uploadUrl: string) {
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId: userId
          },
          UpdateExpression: 'set attachmentUrl = :Url',
          ExpressionAttributeValues: {
            ':Url': uploadUrl
          },
          ReturnValues: "UPDATED_NEW"
        }).promise()
      }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
    
}