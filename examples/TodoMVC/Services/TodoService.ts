import { inject } from "../../../src";
import { computed, action } from "mobx";
import { TodoContext } from "./TodoContext";

export class TodoService {
  @inject todoContext: TodoContext;
  nextId = this.todoContext.todos.length;

  @computed
  get hasTodos() {
    return this.todoContext.todos.length > 0;
  }

  @computed
  get activeTodosCount() {
    let count = 0;
    this.todoContext.todos.forEach(todo => {
      if (!todo.done) {
        count++;
      }
    });
    return count;
  }

  @computed
  get allTodosCompleted() {
    return this.todoContext.todos.every(todo => todo.done);
  }

  @action
  toggleAllTodos(done: boolean) {
    this.todoContext.todos.forEach(todo => {
      todo.done = done;
    });
  }

  @action
  addTodo(title: string) {
    this.todoContext.todos.push({
      id: this.nextId++,
      title: title,
      done: false
    });
  }

  @action
  removeTodo(id: number) {
    const index = this.todoContext.todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      this.todoContext.todos.splice(index, 1);
    }
  }

  @action
  clearCompleted() {
    this.todoContext.todos = this.todoContext.todos.filter(todo => !todo.done);
  }
}
