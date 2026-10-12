const STORAGE_KEY = "college-reading-list";

let books = loadBooks();
let currentFilter = "All";

const bookForm = document.getElementById("bookForm");
const bookTitle = document.getElementById("bookTitle");
const bookStatus = document.getElementById("bookStatus");
const bookList = document.getElementById("bookList");

const countAll = document.getElementById("countAll");
const countToRead = document.getElementById("countToRead");
const countReading = document.getElementById("countReading");
const countDone = document.getElementById("countDone");

const filterButtons = document.querySelectorAll(".filter");

// Load books from browser storage
function loadBooks() {
  try {
    const savedBooks = localStorage.getItem(STORAGE_KEY);
    return savedBooks ? JSON.parse(savedBooks) : [];
  } catch (error) {
    console.error("Could not load books:", error);
    return [];
  }
}

// Save books to browser storage
function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// Add a new book
bookForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = bookTitle.value.trim();
  const status = bookStatus.value;

  if (!title) {
    bookTitle.focus();
    return;
  }

  // Prevent duplicate books
  const duplicateBook = books.some(
    (book) => book.title.toLowerCase() === title.toLowerCase()
  );

  if (duplicateBook) {
    alert("This book is already in your reading list.");
    bookTitle.focus();
    return;
  }

  const newBook = {
    id: Date.now(),
    title,
    status
  };

  books.unshift(newBook);

  saveBooks();
  render();

  bookForm.reset();
  bookTitle.focus();
});
// Change the current filter
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });

    render();
  });
});

// Change a book's status
function updateStatus(id, newStatus) {
  books = books.map((book) => {
    if (book.id === id) {
      return {
        ...book,
        status: newStatus
      };
    }

    return book;
  });

  saveBooks();
  render();
}

// Escape HTML so titles are safely displayed
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Get CSS class for a status
function getStatusClass(status) {
  switch (status) {
    case "To read":
      return "status-to-read";
    case "Reading":
      return "status-reading";
    case "Done":
      return "status-done";
    default:
      return "";
  }
}

// Update count numbers
function updateCounts() {
  countAll.textContent = books.length;
  countToRead.textContent =
    books.filter((book) => book.status === "To read").length;
  countReading.textContent =
    books.filter((book) => book.status === "Reading").length;
  countDone.textContent =
    books.filter((book) => book.status === "Done").length;
}

// Render book cards
function render() {
  updateCounts();

  const visibleBooks =
    currentFilter === "All"
      ? books
      : books.filter((book) => book.status === currentFilter);

  if (visibleBooks.length === 0) {
    bookList.innerHTML = `
      <div class="empty-state">
        <p>No books yet. Add your first book.</p>
      </div>
    `;
    return;
  }

  bookList.innerHTML = visibleBooks
    .map(
      (book) => `
        <article class="book-card">
          <h2 class="book-title">${escapeHTML(book.title)}</h2>

          <div class="card-bottom">
            <span class="status-badge ${getStatusClass(book.status)}">
              ${book.status}
            </span>

            <select
              class="status-select"
              aria-label="Change status for ${escapeHTML(book.title)}"
              data-id="${book.id}"
            >
              <option value="To read" ${
                book.status === "To read" ? "selected" : ""
              }>
                To read
              </option>

              <option value="Reading" ${
                book.status === "Reading" ? "selected" : ""
              }>
                Reading
              </option>

              <option value="Done" ${
                book.status === "Done" ? "selected" : ""
              }>
                Done
              </option>
            </select>
          </div>

          <div class="book-actions">
            <button class="edit-btn" data-id="${book.id}">
              Edit
            </button>

            <button class="delete-btn" data-id="${book.id}">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");

  // Status change
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      const id = Number(event.target.dataset.id);
      updateStatus(id, event.target.value);
    });
  });

  // Edit button
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      editBook(id);
    });
  });

  // Delete button
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      deleteBook(id);
    });
  });
}
// Delete a book
function deleteBook(id) {
  const book = books.find((book) => book.id === id);

  if (!book) return;

  const confirmed = confirm(
    `Are you sure you want to delete "${book.title}"?`
  );

  if (!confirmed) return;

  books = books.filter((book) => book.id !== id);

  saveBooks();
  render();
}

// Edit a book
function editBook(id) {
  const book = books.find((book) => book.id === id);

  if (!book) return;

  const newTitle = prompt("Edit book title:", book.title);

  if (newTitle === null) return;

  const title = newTitle.trim();

  if (!title) {
    alert("Book title cannot be empty.");
    return;
  }

  // Prevent duplicate titles
  const duplicateBook = books.some(
    (item) =>
      item.id !== id &&
      item.title.toLowerCase() === title.toLowerCase()
  );

  if (duplicateBook) {
    alert("Another book with this title already exists.");
    return;
  }

  book.title = title;

  saveBooks();
  render();
}