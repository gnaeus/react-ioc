import React, { Component } from "react";
import { inject } from "../../../src";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { Todo } from "../Models";
import { TodoService } from "../Services";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { Button } from "./Button";

@observer
export class TodoItem extends Component<{ todo: Todo }> {
  @inject todoService: TodoService;

  @observable edit: boolean = false;

  @action
  removeTodo() {}

  render() {
    const { todo } = this.props;
    return (
      <div>
        <Checkbox name="done" model={todo} />
        {this.edit ? (
          <Input name="title" model={todo} />
        ) : (
          <span
            style={{ textDecoration: todo.done ? "line-through" : "none" }}
            onClick={action(() => {
              this.edit = true;
            })}
          >
            {todo.title}
          </span>
        )}
        <Button onClick={() => this.todoService.removeTodo(todo.id)}>X</Button>
      </div>
    );
  }
}
