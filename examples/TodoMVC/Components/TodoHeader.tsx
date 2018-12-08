import React, { Component } from "react";
import { inject } from "../../../src";
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react";
import { TodoService } from "../Services";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";

@observer
export class TodoHeader extends Component {
  @inject todoService: TodoService;

  @observable title: string = "";

  @computed
  get allCompleted() {
    return this.todoService.allTodosCompleted;
  }
  set allCompleted(done: boolean) {
    this.todoService.toggleAllTodos(done);
  }

  @action
  addTodo() {
    this.todoService.addTodo(this.title);
    this.title = "";
  }

  render() {
    const hasTodos = this.todoService.hasTodos;
    return (
      <div>
        <Checkbox
          name="allCompleted"
          model={this}
          style={{ visiblilty: hasTodos ? "visible" : "hidden" }}
        />
        <Input
          name="title"
          model={this}
          onKeyPress={e => {
            if (e.charCode === 13) {
              this.addTodo();
            }
          }}
        />
      </div>
    );
  }
}
