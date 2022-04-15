import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'


const logger = createLogger('todosBusinessLogic')

// TODO: Implement businessLogic
const todosAcess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()


export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const todoItem = {
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,  // if the user creates a todo item the "done" field should be false by default (otherwise why create a todo item if it's already done)
    attachmentUrl: null,  // initially the attachmentUrl is null, when the user uploads a file the attachmentUrl will be updated
  }
  return await todosAcess.createTodo(todoItem)
}

export async function updateTodo (
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest,
): Promise<TodoItem> {

  const todoItem = await todosAcess.getTodoById(todoId, userId)

  if (!todoItem) {
    throw new createError.NotFound(`Todo item with id ${todoId} not found`)
  }
  
  if (todoItem.userId !== userId) {
    throw new createError.Unauthorized(`Unauthorized to delete todo item with id ${todoId}`)
  }

  return await todosAcess.updateTodo(todoId, userId, updateTodoRequest as TodoUpdate)

}

export async function getTodosForUser(
  userId: string
): Promise<TodoItem[]> {
  return await todosAcess.getTodosForUser(userId)
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  const todoItem = await todosAcess.getTodoById(todoId, userId)
  if (!todoItem) {
    throw new createError.NotFound(`Todo item with id ${todoId} not found`)
  }
  if (todoItem.userId !== userId) {
    throw new createError.Unauthorized(`Unauthorized to delete todo item with id ${todoId}`)
  }
  await todosAcess.deleteTodo(todoId, userId)
}


export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string,
): Promise<string> {
  const todoItem = await todosAcess.getTodoById(todoId, userId)
  if (!todoItem) {
    throw new createError.NotFound(`Todo item with id ${todoId} not found`)
  }
  if (todoItem.userId !== userId) {
    throw new createError.Unauthorized(`Unauthorized to delete todo item with id ${todoId}`)
  }
  // the steps are: create a presigned url for a given attachmentId
  // then update the field in dynamodb for that todo item

  // const attachmentId = uuid.v4()
  // we're setting the attachmentId = todoId (which is already an uuid), so no need to create another uuid
  const attachmentId = todoId
  const uploadUrl = await attachmentUtils.getUploadUrl(attachmentId)
  logger.info("uploadUrl: " + uploadUrl)

  // we only update the attachmentUrl in the database but we don't return anything; the function asks for the presigned URL to be returned!

  // const attachmentUrl = `https://${attachmentUtils.bucketName}.s3.amazonaws.com/${attachmentId}`
  const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)
  logger.info("attachmentUrl: " + attachmentUrl)
  
  await todosAcess.updateAttachmentUrl(todoId, userId, attachmentUrl)
  return uploadUrl



    

  
}