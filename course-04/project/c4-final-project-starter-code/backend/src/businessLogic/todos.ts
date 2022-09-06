import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { DataLayer } from "../dataLayer/todoDataLayer";
import { v4 as uuid } from 'uuid'


const dataLayer = new DataLayer();

// getTodosForUser
export async function getTodosForUser(userId: String): Promise<TodoItem[]> {
    return await dataLayer.getTodosForUser(userId)
}

// updateTodo
export async function updateTodo(userId: String, todoId: String, updatedTodo: UpdateTodoRequest): Promise<Boolean> {
    return dataLayer.updateTodo(userId, todoId, updatedTodo)
}

// createTodo
export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
    const todoId = uuid()
    return await dataLayer.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
    })
}

// deleteTodo
export async function deleteTodo(userId: String, todoId: String): Promise<Boolean> {
    return dataLayer.deleteTodo(userId, todoId)
}

// createAttachmentPresignedUrl
export function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return dataLayer.createAttachmentPresignedUrl(todoId);
}