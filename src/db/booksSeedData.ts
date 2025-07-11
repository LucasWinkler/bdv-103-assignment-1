import { ObjectId } from 'mongodb';

import type { Book } from '../../adapter/assignment-4';

export const books: Book[] = [
  {
    id: new ObjectId().toString(),
    name: "Giant's Bread",
    author: 'Agatha Christie',
    description:
      "'A satisfying novel.' New York Times 'When Miss Westmacott reaches the world of music, her book suddenly comes alive. The chapters in which Jane appears are worth the rest of the book put together.' New Statesman --This text refers to an out of print or unavailable edition of this title.",
    price: 21.86,
    image:
      'https://upload.wikimedia.org/wikipedia/en/4/45/Giant%27s_Bread_First_Edition_Cover.jpg',
  },
  {
    id: new ObjectId().toString(),
    name: 'Appointment with Death',
    author: 'Agatha Christie',
    description:
      'In this exclusive authorized edition from the Queen of Mystery, the unstoppable Hercule Poirot finds himself in the Middle East with only one day to solve a murder..',
    price: 19.63,
    image:
      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Appointment_with_Death_First_Edition_Cover_1938.jpg/220px-Appointment_with_Death_First_Edition_Cover_1938.jpg',
  },
  {
    id: new ObjectId().toString(),
    name: 'Beowulf: The Monsters and the Critics',
    author: 'J.R.R Tolkein',
    description:
      "J. R. R. Tolkien's essay 'Beowulf: The Monsters and the Critics', initially delivered as the Sir Israel Gollancz Memorial Lecture at the British Academy in 1936, and first published as a paper in the Proceedings of the British Academy that same year, is regarded as a formative work in modern Beowulf studies. In it, Tolkien speaks against critics who play down the monsters in the poem, namely Grendel, Grendel's mother, and the dragon, in favour of using Beowulf solely as a source for Anglo-Saxon history.",
    price: 19.95,
    image:
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg/220px-Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg',
  },
  {
    id: new ObjectId().toString(),
    name: 'The Complete Works of William Shakespeare',
    author: 'William Shakespeare',
    description:
      "No library is complete without the classics! This leather-bound edition includes the complete works of the playwright and poet William Shakespeare, considered by many to be the English language's greatest writer.",
    price: 39.99,
    image: 'https://m.media-amazon.com/images/I/71Bd39ofMAL._SL1500_.jpg',
  },
  {
    id: new ObjectId().toString(),
    name: 'Iliad & Odyssey',
    author: 'Homer',
    description:
      'No home library is complete without the classics! Iliad & Odyssey brings together the two essential Greek epics from the poet Homer in an elegant, leather-bound, omnibus edition-a keepsake to be read and treasured.',
    price: 33.99,
    image: 'https://m.media-amazon.com/images/I/71ZWKmOIpVL._SL1500_.jpg',
  },
  {
    id: new ObjectId().toString(),
    name: 'Modern Software Engineering: Doing What Works to Build Better Software Faster',
    author: 'David Farley',
    description:
      'In Modern Software Engineering, continuous delivery pioneer David Farley helps software professionals think about their work more effectively, manage it more successfully, and genuinely improve the quality of their applications, their lives, and the lives of their colleagues.',
    price: 51.56,
    image: 'https://m.media-amazon.com/images/I/81sji+WquSL._SL1500_.jpg',
  },
  {
    id: new ObjectId().toString(),
    name: 'Domain-Driven Design: Tackling Complexity in the Heart of Software',
    author: 'Eric Evans',
    description:
      'Leading software designers have recognized domain modeling and design as critical topics for at least twenty years, yet surprisingly little has been written about what needs to be done or how to do it.',
    price: 91.99,
    image: 'https://m.media-amazon.com/images/I/71Qde+ZerdL._SL1500_.jpg',
  },
];
