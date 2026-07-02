const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
    const { search } = req.query;
    let sql = 'SELECT * FROM MEDICO WHERE ativo = 1';
    const params = [];
    if (search) {
        sql += ' AND (nome LIKE ? OR crm LIKE ? OR especialidade LIKE ?)';
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    sql += ' ORDER BY nome';
    res.json(db.prepare(sql).all(...params));
});

router.get('/:id', auth, (req, res) => {
    const m = db.prepare('SELECT * FROM MEDICO WHERE id_medico = ? AND ativo = 1').get(req.params.id);
    if (!m) return res.status(404).json({ error: 'Médico não encontrado.' });
    res.json(m);
});

router.post('/', auth, (req, res) => {
    const { nome, crm, especialidade, telefone, email } = req.body;
    if (!nome || !crm || !especialidade) return res.status(400).json({ error: 'Nome, CRM e especialidade são obrigatórios.' });
    try {
        const r = db.prepare(
            'INSERT INTO MEDICO (nome, crm, especialidade, telefone, email) VALUES (?, ?, ?, ?, ?)'
        ).run(nome.trim(), crm.trim(), especialidade.trim(), telefone || null, email || null);
        res.status(201).json(db.prepare('SELECT * FROM MEDICO WHERE id_medico = ?').get(r.lastInsertRowid));
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'CRM ou e-mail já cadastrado.' });
        res.status(500).json({ error: 'Erro interno ao criar médico.' });
    }
});

router.put('/:id', auth, (req, res) => {
    const { nome, crm, especialidade, telefone, email } = req.body;
    if (!nome || !crm || !especialidade) return res.status(400).json({ error: 'Nome, CRM e especialidade são obrigatórios.' });
    try {
        db.prepare(
            'UPDATE MEDICO SET nome=?, crm=?, especialidade=?, telefone=?, email=? WHERE id_medico=?'
        ).run(nome.trim(), crm.trim(), especialidade.trim(), telefone || null, email || null, req.params.id);
        res.json(db.prepare('SELECT * FROM MEDICO WHERE id_medico = ?').get(req.params.id));
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'CRM ou e-mail já cadastrado para outro médico.' });
        res.status(500).json({ error: 'Erro interno ao atualizar médico.' });
    }
});

router.delete('/:id', auth, (req, res) => {
    const consultas = db.prepare("SELECT COUNT(*) as c FROM CONSULTA WHERE id_medico=? AND status='agendada'").get(req.params.id);
    if (consultas.c > 0) return res.status(400).json({ error: 'Médico possui consultas agendadas. Cancele-as primeiro.' });
    db.prepare('UPDATE MEDICO SET ativo = 0 WHERE id_medico = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
