export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export type TodoFilter = "all" | "active" | "completed";
