const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
    const { search } = req.query;
    let sql = 'SELECT * FROM PACIENTE WHERE ativo = 1';
    const params = [];
    if (search) {
        sql += ' AND (nome LIKE ? OR cpf LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        const like = `%${search}%`;
        params.push(like, like, like, like);
    }
    sql += ' ORDER BY nome';
    res.json(db.prepare(sql).all(...params));
});

router.get('/:id', auth, (req, res) => {
    const p = db.prepare('SELECT * FROM PACIENTE WHERE id_paciente = ? AND ativo = 1').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Paciente não encontrado.' });
    res.json(p);
});

router.post('/', auth, (req, res) => {
    const { nome, cpf, telefone, email, data_nascimento } = req.body;
    if (!nome || !cpf) return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
    try {
        const r = db.prepare(
            'INSERT INTO PACIENTE (nome, cpf, telefone, email, data_nascimento) VALUES (?, ?, ?, ?, ?)'
        ).run(nome.trim(), cpf.trim(), telefone || null, email || null, data_nascimento || null);
        res.status(201).json(db.prepare('SELECT * FROM PACIENTE WHERE id_paciente = ?').get(r.lastInsertRowid));
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'CPF já cadastrado.' });
        res.status(500).json({ error: 'Erro interno ao criar paciente.' });
    }
});

router.put('/:id', auth, (req, res) => {
    const { nome, cpf, telefone, email, data_nascimento } = req.body;
    if (!nome || !cpf) return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
    try {
        db.prepare(
            'UPDATE PACIENTE SET nome=?, cpf=?, telefone=?, email=?, data_nascimento=? WHERE id_paciente=?'
        ).run(nome.trim(), cpf.trim(), telefone || null, email || null, data_nascimento || null, req.params.id);
        res.json(db.prepare('SELECT * FROM PACIENTE WHERE id_paciente = ?').get(req.params.id));
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'CPF já cadastrado para outro paciente.' });
        res.status(500).json({ error: 'Erro interno ao atualizar paciente.' });
    }
});

router.delete('/:id', auth, (req, res) => {
    const consultas = db.prepare("SELECT COUNT(*) as c FROM CONSULTA WHERE id_paciente=? AND status='agendada'").get(req.params.id);
    if (consultas.c > 0) return res.status(400).json({ error: 'Paciente possui consultas agendadas. Cancele-as primeiro.' });
    db.prepare('UPDATE PACIENTE SET ativo = 0 WHERE id_paciente = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
