import React, { Component } from "react";
import cn from "classnames";
import { inject } from "../../../src";
import { observer } from "mobx-react";
import { FilterService, TodoContext, TodoService } from "../Services";
import { Button } from "./Button";

@observer
export class TodoFooter extends Component {
  @inject todoContext: TodoContext;
  @inject todoService: TodoService;
  @inject filterService: FilterService;

  render() {
    const count = this.todoService.activeTodosCount;
    const filter = this.todoContext.filter;
    return (
      <div>
        <div>
          {count} item{count !== 1 && "s"} left
        </div>
        <div>
          <Button
            className={cn({ active: filter === "all" })}
            onClick={() => this.filterService.applyFilter("all")}
          >
            All
          </Button>
          <Button
            className={cn({ active: filter === "active" })}
            onClick={() => this.filterService.applyFilter("active")}
          >
            Active
          </Button>
          <Button
            className={cn({ active: filter === "completed" })}
            onClick={() => this.filterService.applyFilter("completed")}
          >
            Completed
          </Button>
        </div>
        <div>
          <Button onClick={() => this.todoService.clearCompleted()}>
            Clear completed
          </Button>
        </div>
      </div>
    );
  }
}
