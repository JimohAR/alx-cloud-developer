import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('dataLayer')

export class ToDoAccess {
    constructor(
        private readonly dbClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly s3BucketName = process.env.S3_BUCKET_NAME,
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosTableIndex = process.env.TODOS_TABLE_INDEX_NAME
    ) { }

    // getTodosForUser
    async getTodosForUser(userId: String): Promise<TodoItem[]> {
        // logger.info(`Getting todos for user ${userId}`)
        const result = await this.dbClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosTableIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeNames: {
                    '#userId': userId
                }
            }).promise()

        // logger.info(`Returning ${result.Count} items for user ${userId}.`)
        return result.Items as TodoItem[]
    }

    // updateTodo
    async updateTodo(userId: String, todoId: String, todo: UpdateTodoRequest): Promise<Boolean> {
        // TODO more validation checks
        try {
            await this.dbClient
                .update({
                    TableName: this.todosTable,
                    Key: {
                        userId,
                        todoId
                    },
                    UpdateExpression:
                        'set #name = :name, #dueDate = :duedate, #done = :done',
                    ExpressionAttributeValues: {
                        ':name': todo.name,
                        ':duedate': todo.dueDate,
                        ':done': todo.done
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
            logger.error('Failure updating todo', {
                error: err
            })
            return false
        }

        return true
    }


    // createTodo
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Creating new todo")
        try {
            await this.dbClient.put({
                TableName: this.todosTable,
                Item: todo
            }).promise()

            logger.info(`Created todo ${todo.todoId} for user ${todo.userId}.`)
            return todo
        } catch (err) {
            throw err
        }
    }

    // deleteTodo
    async deleteTodo(userId: String, todoId: String): Promise<Boolean> {
        try {
            await this.dbClient.delete({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                }
            }).promise()
            logger.info(`Successfully deleted todo ${todoId}`)
        } catch (err) {
            logger.error('Error deleting item from database', { error: err })
            return false
        }
        return true
    }

    // createAttachmentPresignedUrl
    async createAttachmentPresignedUrl(todoId: string): Promise<string> {
        logger.info("Generating URL");

        const url: string = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 300,
        });

        return url;
    }
}