const express = require('express')
const { v4: uuid } = require('uuid')

const router = express.Router()
const fileMulter = require('../middleware/file')

class Book {
  constructor(
    title = '',
    description = '',
    authors = '',
    favorite = '',
    fileCover = '',
    fileName = '',
    fileBook = '',
  ) {
    this.id = uuid()
    this.title = title
    this.description = description
    this.authors = authors
    this.favorite = favorite
    this.fileCover = fileCover
    this.fileName = fileName
    this.fileBook = fileBook
  }
}

const store = {
  books: [],
}

// Получить все книги
router.get('/', (req, res) => {
  const { books } = store

  res.render('index', {
    title: 'Все книги',
    books: books,
  })
})

// Получить все книги
router.get('/create', (req, res) => {
  res.render('create', {
    title: 'Создание книги',
    book: {},
  })
})

// Получить все книги
router.get('/update/:id', (req, res) => {
  const { books } = store
  const { id } = req.params
  const idx = books.findIndex((el) => el.id === id)

  if (idx !== -1) {
    res.render('update', {
      title: `Редактирование ${books[idx].title}`,
      book: books[idx],
    })
  } else {
    res.status(404)
    res.json('404 | Книга не найдена')
  }
})

// Получить книгу по ID
router.get('/:id', async (req, res) => {
  const { books } = store
  const { id } = req.params

  const idx = books.findIndex((el) => el.id === id)

  if (idx !== -1) {
    await fetch(`http://counter-service:4000/counter/${id}/incr`, {
      method: 'POST',
    })

    const response = await fetch(`http://counter-service:4000/counter/${id}`)
    const data = await response.json()

    res.render('view', {
      title: books[idx].title,
      book: books[idx],
      count: data.count,
    })
  } else {
    res.status(404)
    res.json('404 | Книга не найдена')
  }
})

// Скачать файл книги по ID
router.get('/:id/download', (req, res) => {
  const { books } = store
  const { id } = req.params
  const idx = books.findIndex((el) => el.id === id)

  if (idx !== -1) {
    const book = books[idx]
    if (book.fileBook) {
      // Отправляем файл для скачивания
      res.download(book.fileBook, book.fileName, (err) => {
        if (err) {
          res.status(404).json('Файл не найден')
        }
      })
    } else {
      res.status(404).json('Файл книги не найден')
    }
  } else {
    res.status(404)
    res.json('404 | Книга не найдена')
  }
})

// Создать книгу
router.post('/create', fileMulter.single('fileBook'), (req, res) => {
  const { books } = store
  const { title, description, authors, favorite, fileCover, fileName } =
    req.body

  const fileBookPath = req.file ? req.file.path : ''
  const actualFileName = req.file ? req.file.originalname : fileName

  const newBook = new Book(
    title,
    description,
    authors,
    favorite,
    fileCover,
    actualFileName,
    fileBookPath,
  )
  books.push(newBook)

  res.redirect('/api/books')
})

// Редактировать книгу по ID
router.post('/update/:id', fileMulter.single('fileBook'), (req, res) => {
  const { books } = store
  const { title, description, authors, favorite, fileCover, fileName } =
    req.body
  const { id } = req.params
  const idx = books.findIndex((el) => el.id === id)

  if (idx !== -1) {
    const fileBookPath = req.file ? req.file.path : books[idx].fileBook
    const actualFileName = req.file
      ? req.file.originalname
      : books[idx].fileName

    books[idx] = {
      ...books[idx],
      title: title || books[idx].title,
      description: description || books[idx].description,
      authors: authors || books[idx].authors,
      favorite: favorite || books[idx].favorite,
      fileCover: fileCover || books[idx].fileCover,
      fileName: actualFileName,
      fileBook: fileBookPath,
    }

    res.redirect('/api/books')
  } else {
    res.status(404)
    res.json('404 | Книга не найдена')
  }
})

// Удалить книгу по ID
router.post('/delete/:id', (req, res) => {
  const { books } = store
  const { id } = req.params
  const idx = books.findIndex((el) => el.id === id)

  if (idx !== -1) {
    books.splice(idx, 1)
    res.redirect('/api/books')
  } else {
    res.status(404)
    res.json('404 | Книга не найдена')
  }
})

module.exports = router
