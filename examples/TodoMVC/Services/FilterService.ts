import { inject } from "../../../src";
import { computed, action } from "mobx";
import { TodoFilter } from "../Models";
import { TodoContext } from "./TodoContext";

export class FilterService {
  @inject todoContext: TodoContext;

  @computed
  get filteredTodos() {
    const allTodos = this.todoContext.todos.slice().reverse();

    switch (this.todoContext.filter) {
      case "all":
        return allTodos;
      case "active":
        return allTodos.filter(todo => !todo.done);
      case "completed":
        return allTodos.filter(todo => todo.done);
    }
  }

  @action
  applyFilter(filter: TodoFilter) {
    this.todoContext.filter = filter;
  }
}
