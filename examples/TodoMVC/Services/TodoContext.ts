import { observable } from "mobx";
import { Todo, TodoFilter } from "../Models";

export class TodoContext {
  @observable todos: Todo[] = [];
  @observable filter: TodoFilter = "all";
}
