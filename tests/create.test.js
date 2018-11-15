import expect from 'expect';
import { create } from '../src/microstates';
import { valueOf } from '../src/meta';

describe('Create with References', () => {
  class Post {
    author = Author;
  }

  class Author {
    name = String;
  }

  let bro = { name: 'Ernest Hemingbro' };
  let author, post;

  beforeEach(function() {
    author = create(Author, bro);
    post = create(Post, undefined, { author });
  });

  it('value of post.author is same as reference objects value', () => {
    expect(valueOf(post.author)).toBe(bro);
  });
});
