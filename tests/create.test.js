import expect from 'expect';
import { create } from '..';

describe.only('Create with References', () => {
  class Post {
    author = Author;
  }

  class Author {
    name = String;
  }

  let author, post;

  beforeEach(function() {
    author = create(Author, { name: 'Ernest Hemingbro' });
    post = create(Post, undefined, { author });
  });
});
