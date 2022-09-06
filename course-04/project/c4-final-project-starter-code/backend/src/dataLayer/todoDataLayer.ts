import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('dataLayer')

export class DataLayer {
    constructor(
        private readonly dbClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly urlExp = process.env.SIGNED_URL_EXPIRATION
    ) { }

    // getTodosForUser
    async getTodosForUser(userId: String): Promise<TodoItem[]> {
        const result = await this.dbClient
            .query({
                TableName: this.todosTable,
                KeyConditionExpression: '#userId = :userId',
                ExpressionAttributeNames: {
                    "#userId": "userId"
                },
                ExpressionAttributeValues: {
                    ":userId": userId
                }
            }).promise()

        return result.Items as TodoItem[]
    }

    // updateTodo
    async updateTodo(userId: String, todoId: String, todo: UpdateTodoRequest): Promise<Boolean> {
        logger.info(`Attemping to update todo - ${todoId}`)
        try {
            await this.dbClient
                .update({
                    TableName: this.todosTable,
                    Key: {
                        "userId": userId,
                        "todoId": todoId
                    },
                    UpdateExpression:
                        'set #name = :name, #dueDate = :duedate, #done = :done',
                    ExpressionAttributeValues: {
                        ':name': todo['name'],
                        ':duedate': todo['dueDate'],
                        ':done': todo['done']
                    },
                    ExpressionAttributeNames: {
                        '#name': 'name',
                        '#dueDate': 'dueDate',
                        '#done': 'done'
                    },
                    ReturnValues: "ALL_NEW"
                })
                .promise()
        } catch (err) {
            logger.error(`Failure updating todo - ${todoId}`, err)
            return false
        }

        logger.info(`Todo - ${todoId} updated`)
        return true
    }


    // createTodo
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Creating new todo")
        await this.dbClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        logger.info(`Created new todo - ${todo.todoId}`)
        return todo as TodoItem
    }

    // deleteTodo
    async deleteTodo(userId: String, todoId: String): Promise<Boolean> {
        try {
            await this.dbClient.delete({
                TableName: this.todosTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                }
            }).promise()
            logger.info(`todo - ${todoId} deleted`)
        } catch (err) {
            logger.error('Error deleting todo from database', err)
            return false
        }
        return true
    }

    // createAttachmentPresignedUrl
    async createAttachmentPresignedUrl(todoId: string): Promise<string> {
        logger.info("Generating PresignedUrl");

        const url: string = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: this.urlExp,
        });

        return url as string;
    }
}