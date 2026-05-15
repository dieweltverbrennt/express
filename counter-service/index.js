const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()

app.use(express.json())

const DATA_FILE = path.join(__dirname, 'data', 'counters.json')

// чтение файла
function readCounters() {
  const data = fs.readFileSync(DATA_FILE, 'utf8')

  return JSON.parse(data)
}

// запись файла
function writeCounters(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

app.post('/counter/:bookId/incr', async (req, res) => {
  const { bookId } = req.params

  const counters = readCounters()

  counters[bookId] = (counters[bookId] || 0) + 1

  writeCounters(counters)

  res.json({
    bookId,
    count: counters[bookId],
  })
})

// Получить значение счётчика
app.get('/counter/:bookId', async (req, res) => {
  const { bookId } = req.params

  const counters = readCounters()

  res.json({
    bookId,
    count: counters[bookId] || 0,
  })
})

const PORT = process.env.PORT || 4000
app.listen(PORT)
