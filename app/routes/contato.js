const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/', (req, res) => {
    const { nome, email, assunto, mensagem } = req.body;
    if (!nome || !email || !assunto || !mensagem) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }
    db.prepare('INSERT INTO CONTATO (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)')
      .run(nome.trim(), email.trim(), assunto.trim(), mensagem.trim());
    res.json({ success: true, message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' });
});

module.exports = router;
