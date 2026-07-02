const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
    const { data_inicio, data_fim, id_medico, id_paciente, status, search } = req.query;
    let sql = `
        SELECT c.*, m.nome AS medico_nome, m.especialidade,
               p.nome AS paciente_nome, p.cpf
        FROM CONSULTA c
        JOIN MEDICO   m ON c.id_medico   = m.id_medico
        JOIN PACIENTE p ON c.id_paciente = p.id_paciente
        WHERE 1=1
    `;
    const params = [];
    if (data_inicio) { sql += ' AND c.data >= ?'; params.push(data_inicio); }
    if (data_fim)    { sql += ' AND c.data <= ?'; params.push(data_fim); }
    if (id_medico)   { sql += ' AND c.id_medico = ?';  params.push(id_medico); }
    if (id_paciente) { sql += ' AND c.id_paciente = ?'; params.push(id_paciente); }
    if (status)      { sql += ' AND c.status = ?'; params.push(status); }
    if (search)      {
        sql += ' AND (m.nome LIKE ? OR p.nome LIKE ? OR c.motivo LIKE ?)';
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    sql += ' ORDER BY c.data DESC, c.hora DESC';
    res.json(db.prepare(sql).all(...params));
});

router.get('/stats', auth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const total    = db.prepare('SELECT COUNT(*) as c FROM CONSULTA').get().c;
    const hoje     = db.prepare("SELECT COUNT(*) as c FROM CONSULTA WHERE data = ? AND status='agendada'").get(today).c;
    const agendada = db.prepare("SELECT COUNT(*) as c FROM CONSULTA WHERE status='agendada'").get().c;
    const realizada= db.prepare("SELECT COUNT(*) as c FROM CONSULTA WHERE status='realizada'").get().c;
    const cancelada= db.prepare("SELECT COUNT(*) as c FROM CONSULTA WHERE status='cancelada'").get().c;
    const pacientes= db.prepare('SELECT COUNT(*) as c FROM PACIENTE WHERE ativo=1').get().c;
    const medicos  = db.prepare('SELECT COUNT(*) as c FROM MEDICO WHERE ativo=1').get().c;
    res.json({ total, hoje, agendada, realizada, cancelada, pacientes, medicos });
});

router.get('/:id', auth, (req, res) => {
    const c = db.prepare(`
        SELECT c.*, m.nome AS medico_nome, p.nome AS paciente_nome
        FROM CONSULTA c
        JOIN MEDICO m ON c.id_medico = m.id_medico
        JOIN PACIENTE p ON c.id_paciente = p.id_paciente
        WHERE c.id_consulta = ?
    `).get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Consulta não encontrada.' });
    res.json(c);
});

router.post('/', auth, (req, res) => {
    const { data, hora, motivo, id_medico, id_paciente } = req.body;
    if (!data || !hora || !id_medico || !id_paciente) {
        return res.status(400).json({ error: 'Data, hora, médico e paciente são obrigatórios.' });
    }
    const conflict = db.prepare(
        "SELECT id_consulta FROM CONSULTA WHERE id_medico=? AND data=? AND hora=? AND status='agendada'"
    ).get(id_medico, data, hora);
    if (conflict) return res.status(400).json({ error: 'Médico já possui consulta agendada neste horário.' });

    const r = db.prepare(
        'INSERT INTO CONSULTA (data, hora, motivo, id_medico, id_paciente) VALUES (?, ?, ?, ?, ?)'
    ).run(data, hora, motivo || null, id_medico, id_paciente);
    res.status(201).json(db.prepare('SELECT * FROM CONSULTA WHERE id_consulta = ?').get(r.lastInsertRowid));
});

router.put('/:id', auth, (req, res) => {
    const { data, hora, status, motivo, prontuario, id_medico, id_paciente } = req.body;
    if (!data || !hora || !id_medico || !id_paciente) {
        return res.status(400).json({ error: 'Data, hora, médico e paciente são obrigatórios.' });
    }
    if (status === 'agendada') {
        const conflict = db.prepare(
            "SELECT id_consulta FROM CONSULTA WHERE id_medico=? AND data=? AND hora=? AND status='agendada' AND id_consulta != ?"
        ).get(id_medico, data, hora, req.params.id);
        if (conflict) return res.status(400).json({ error: 'Médico já possui consulta agendada neste horário.' });
    }
    db.prepare(
        'UPDATE CONSULTA SET data=?, hora=?, status=?, motivo=?, prontuario=?, id_medico=?, id_paciente=? WHERE id_consulta=?'
    ).run(data, hora, status || 'agendada', motivo || null, prontuario || null, id_medico, id_paciente, req.params.id);
    res.json(db.prepare('SELECT * FROM CONSULTA WHERE id_consulta = ?').get(req.params.id));
});

router.delete('/:id', auth, (req, res) => {
    db.prepare("UPDATE CONSULTA SET status='cancelada' WHERE id_consulta=?").run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
