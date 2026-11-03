/* How to add a book: copy an object into the books list.
   title and description are required. cover and link are optional.
   cover is an image path or web address. link is a file path or web address.
   shelf: "bottom" and align: "end" stand a book at the far right of the
   bottom shelf. dusty: true draws the worn leather spine.

     {
       title: "My Novel",
       description: "One or two sentences about the book.",
       cover: "covers/my-novel.jpg",
       link: "pdfs/my-novel.pdf"
     }

   Leave books empty and the shelf keeps one Coming soon book.
   placeholderNote is the text inside that book.

   Random Ideas entries live in books/random-ideas/data/ideas.json.
   See books/random-ideas/README.md for how to add one.
*/
(function () {
  window.DUKKTAPE_STORIES = {
    placeholderNote: "Coming soon — I'll add my books here as I finish them.",
    books: [
      {
        title: "River's Run: River and the Wolf Cry",
        description: "River learns why telling the truth matters. A retelling of The Boy Who Cried Wolf.",
        cover: "books/rivers-run-wolf-cry/cover.jpg",
        link: "books/rivers-run-wolf-cry/"
      },
      {
        title: "Random Ideas",
        description: "A list of story ideas. Each entry has a title, where it stands, a date, and a premise.",
        link: "books/random-ideas/",
        shelf: "bottom",
        align: "end",
        dusty: true
      }
    ]
  };
})();
