const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/db');

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    const user = db.prepare('SELECT * FROM USUARIO WHERE email = ?').get(email.trim().toLowerCase());
    if (!user || !bcrypt.compareSync(senha, user.senha)) {
        return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }
    req.session.userId    = user.id_usuario;
    req.session.userEmail = user.email;
    req.session.userName  = user.nome;
    req.session.userTipo  = user.tipo;

    res.json({ success: true, user: { nome: user.nome, email: user.email, tipo: user.tipo } });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

router.get('/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' });
    res.json({ id: req.session.userId, nome: req.session.userName, email: req.session.userEmail, tipo: req.session.userTipo });
});

module.exports = router;
