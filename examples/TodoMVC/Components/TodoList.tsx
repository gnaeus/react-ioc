import React, { Component } from "react";
import { inject } from "../../../src";
import { observer } from "mobx-react";
import { FilterService, TodoService } from "../Services";
import { TodoHeader } from "./TodoHeader";
import { TodoItem } from "./TodoItem";
import { TodoFooter } from "./TodoFooter";

@observer
export class TodoList extends Component {
  @inject todoService: TodoService;
  @inject filterService: FilterService;

  render() {
    const todos = this.filterService.filteredTodos;
    const hasTodos = this.todoService.hasTodos;
    return (
      <div>
        <TodoHeader />
        {hasTodos && (
          <>
            <ul>
              {todos.map(todo => (
                <li>
                  <TodoItem key={todo.id} todo={todo} />
                </li>
              ))}
            </ul>
            <TodoFooter />
          </>
        )}
      </div>
    );
  }
}
