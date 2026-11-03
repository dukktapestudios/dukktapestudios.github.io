/* How to add a book: copy an object into the books list.
   title and description are required. cover and link are optional.
   cover is an image path or web address. link is a file path or web address.

     {
       title: "My Novel",
       description: "One or two sentences about the book.",
       cover: "covers/my-novel.jpg",
       link: "pdfs/my-novel.pdf"
     }

   Leave books empty and the shelf keeps one Coming soon book.
   placeholderNote is the text inside that book.
*/
(function () {
  window.DUKKTAPE_STORIES = {
    placeholderNote: "Coming soon — I'll add my books here as I finish them.",
    books: []
  };
})();
