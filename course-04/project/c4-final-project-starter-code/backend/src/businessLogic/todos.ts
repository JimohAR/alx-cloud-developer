import { TodoItem } from '../models/TodoItem'
// import { TodoData } from '../dataLayer/todosData'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from "../models/TodoUpdate";
import { DataLayer } from "../dataLayer/todoDataLayer";
import { v4 as uuid } from 'uuid'

const DataLayer = new DataLayer();

// getTodosForUser
export async function getUserTodos(userId: String): Promise<TodoItem[]> {
    return await DataLayer.getUserTodos(userId)
}

// updateTodo
export async function updateTodo(userId: String, todoId: String, updatedTodo: UpdateTodoRequest): Promise<Boolean> {
    return DataLayer.updateTodo(userId, todoId, updatedTodo)
}

// createTodo
export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const s3BucketName = process.env.S3_BUCKET_NAME
    return await DataLayer.createTodo({
        userId: userId,
        todoId: uuid,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
    })
}

// deleteTodo
export async function deleteTodo(userId: String, todoId: String): Promise<Boolean> {
    return DataLayer.deleteTodo(userId, todoId)
}

// createAttachmentPresignedUrl
export function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return DataLayer.createAttachmentPresignedUrl(todoId);
}