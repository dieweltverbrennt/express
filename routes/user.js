const express = require('express')
const router = express.Router()

// Авторизация пользователя
router.post('/login', (req, res) => {
  const response = { id: 1, mail: 'test@mail.ru' }
  res.status(201)
  res.json(response)
})

module.exports = router
