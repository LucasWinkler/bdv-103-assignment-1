import { Book } from '../adapter/assignment-2';

const initialBooks: Book[] = [
  {
    id: '1',
    name: "Giant's Bread",
    author: 'Agatha Christie',
    description:
      "'A satisfying novel.' New York Times 'When Miss Westmacott reaches the world of music, her book suddenly comes alive. The chapters in which Jane appears are worth the rest of the book put together.' New Statesman --This text refers to an out of print or unavailable edition of this title.",
    price: 21.86,
    image:
      'https://upload.wikimedia.org/wikipedia/en/4/45/Giant%27s_Bread_First_Edition_Cover.jpg',
  },
];

let books: Book[] = [...initialBooks];

export const bookStore = {
  getAll: (): Book[] => books,

  getById: (id: string): Book | undefined => books.find(book => book.id === id),

  create: (book: Omit<Book, 'id'>): Book => {
    const newBook = {
      ...book,
      id: (books.length + 1).toString(),
    };
    books.push(newBook);
    return newBook;
  },

  update: (id: string, updates: Partial<Book>): Book | undefined => {
    const index = books.findIndex(book => book.id === id);
    if (index === -1) return undefined;

    const updatedBook = {
      ...books[index],
      ...updates,
      id,
    };
    books[index] = updatedBook;
    return updatedBook;
  },

  delete: (id: string): boolean => {
    const index = books.findIndex(book => book.id === id);
    if (index === -1) return false;

    books.splice(index, 1);
    return true;
  },
};
