import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { Todo } from '../dataLayer/todo'

const todoAccess = new Todo()

export async function createTodo(userId, todoId) {
  return await todoAccess.createTodo(userId, todoId)
}

export async function getTodo(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getTodo(userId)
}

export async function updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest) {
  return await todoAccess.updateTodo(userId, todoId, updateTodo)
}

export async function deleteTodo(userId: string, todoId: string) {
  return await todoAccess.deleteTodo(userId, todoId)
}
