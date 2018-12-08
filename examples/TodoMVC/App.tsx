import React, { Component } from "react";
import ReactDOM from "react-dom";
import { provider } from "../../src";
import { TodoContext, TodoService, FilterService } from "./Services";
import { TodoList } from "./Components/TodoList";

@provider(TodoContext, TodoService, FilterService)
class App extends Component {
  render() {
    return <TodoList />;
  }
}

ReactDOM.render(<App />, document.body);
