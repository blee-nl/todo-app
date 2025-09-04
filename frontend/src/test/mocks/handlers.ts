import { http, HttpResponse } from 'msw'
import { mockTodos } from '../utils'

export const handlers = [
  // Get all todos
  http.get('http://localhost:5001/api/todos', () => {
    return HttpResponse.json({
      success: true,
      data: mockTodos,
    })
  }),

  // Get todos by status
  http.get('http://localhost:5001/api/todos/status', ({ request }) => {
    const url = new URL(request.url)
    const completed = url.searchParams.get('completed')
    
    let filteredTodos = mockTodos
    if (completed === 'true') {
      filteredTodos = mockTodos.filter(todo => todo.completed)
    } else if (completed === 'false') {
      filteredTodos = mockTodos.filter(todo => !todo.completed)
    }

    return HttpResponse.json({
      success: true,
      data: filteredTodos,
    })
  }),

  // Get single todo
  http.get('http://localhost:5001/api/todos/:id', ({ params }) => {
    const todo = mockTodos.find(t => t.id === params.id)
    if (!todo) {
      return HttpResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: todo,
    })
  }),

  // Create todo
  http.post('http://localhost:5001/api/todos', async ({ request }) => {
    const body = await request.json() as { text: string }
    const newTodo = {
      id: '3',
      text: body.text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({
      success: true,
      data: newTodo,
    }, { status: 201 })
  }),

  // Update todo
  http.put('http://localhost:5001/api/todos/:id', async ({ params, request }) => {
    const body = await request.json() as { text?: string; completed?: boolean }
    const todo = mockTodos.find(t => t.id === params.id)
    if (!todo) {
      return HttpResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      )
    }
    
    const updatedTodo = {
      ...todo,
      ...body,
      updatedAt: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      success: true,
      data: updatedTodo,
    })
  }),

  // Toggle todo
  http.patch('http://localhost:5001/api/todos/:id/toggle', ({ params }) => {
    const todo = mockTodos.find(t => t.id === params.id)
    if (!todo) {
      return HttpResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      )
    }
    
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      completedAt: !todo.completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      success: true,
      data: updatedTodo,
    })
  }),

  // Delete todo
  http.delete('http://localhost:5001/api/todos/:id', ({ params }) => {
    const todo = mockTodos.find(t => t.id === params.id)
    if (!todo) {
      return HttpResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: { id: params.id },
    })
  }),

  // Delete completed todos
  http.delete('http://localhost:5001/api/todos/completed', () => {
    const completedCount = mockTodos.filter(todo => todo.completed).length
    return HttpResponse.json({
      success: true,
      data: { deletedCount: completedCount },
    })
  }),

  // Health check
  http.get('http://localhost:5001/health', () => {
    return HttpResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: 123.456,
    })
  }),
]
