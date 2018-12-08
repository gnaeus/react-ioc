import React, { Component } from "react";
import { provider, inject } from "../../src";
import {
  DataContext,
  UserService,
  PostService,
  CommentService
} from "./Services";

@provider(DataContext)
class App extends Component {
  render() {
    return (
      <main>
        <ProfilePage />
        <PostsPage />
      </main>
    );
  }
}

@provider(UserService)
class ProfilePage extends Component {
  @inject userService: UserService;

  render() {
    return null;
  }
}

@provider(PostService, CommentService)
class PostsPage extends Component {
  @inject postService: PostService;

  render() {
    return <CommentsWidget />;
  }
}

class CommentsWidget extends Component {
  @inject commentsService: CommentService;

  render() {
    return null;
  }
}

<App />;
