import { observable } from "mobx";
import { inject } from "../../src";

interface User {}
interface Post {}
interface Comment {}

export class DataContext {
  users = observable.map<number, User>();
  posts = observable.map<number, Post>();
  comments = observable.map<number, Comment>();
}

export class UserService {
  @inject dataContext: DataContext;
  // ...
}

export class PostService {
  @inject dataContext: DataContext;
  // ...
}

export class CommentService {
  @inject dataContext: DataContext;
  // ...
}
