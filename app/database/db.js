const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'clinica.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS USUARIO (
        id_usuario    INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT    NOT NULL UNIQUE,
        senha         TEXT    NOT NULL,
        tipo          TEXT    NOT NULL DEFAULT 'admin',
        nome          TEXT,
        criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS MEDICO (
        id_medico     INTEGER PRIMARY KEY AUTOINCREMENT,
        nome          TEXT    NOT NULL,
        crm           TEXT    NOT NULL UNIQUE,
        especialidade TEXT    NOT NULL,
        telefone      TEXT,
        email         TEXT    UNIQUE,
        ativo         INTEGER NOT NULL DEFAULT 1,
        criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PACIENTE (
        id_paciente     INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT    NOT NULL,
        cpf             TEXT    NOT NULL UNIQUE,
        telefone        TEXT,
        email           TEXT,
        data_nascimento TEXT,
        ativo           INTEGER NOT NULL DEFAULT 1,
        criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CONSULTA (
        id_consulta   INTEGER PRIMARY KEY AUTOINCREMENT,
        data          TEXT    NOT NULL,
        hora          TEXT    NOT NULL,
        status        TEXT    NOT NULL DEFAULT 'agendada',
        motivo        TEXT,
        prontuario    TEXT,
        id_medico     INTEGER NOT NULL,
        id_paciente   INTEGER NOT NULL,
        criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_medico)   REFERENCES MEDICO(id_medico)   ON DELETE RESTRICT,
        FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS CONTATO (
        id_contato INTEGER PRIMARY KEY AUTOINCREMENT,
        nome       TEXT NOT NULL,
        email      TEXT NOT NULL,
        assunto    TEXT NOT NULL,
        mensagem   TEXT NOT NULL,
        enviado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_consulta_medico   ON CONSULTA(id_medico);
    CREATE INDEX IF NOT EXISTS idx_consulta_paciente ON CONSULTA(id_paciente);
    CREATE INDEX IF NOT EXISTS idx_consulta_data     ON CONSULTA(data);
`);

// Seed: admin padrão
const adminExists = db.prepare('SELECT id_usuario FROM USUARIO WHERE email = ?').get('admin@clinica.com');
if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO USUARIO (email, senha, tipo, nome) VALUES (?, ?, ?, ?)').run('admin@clinica.com', hash, 'admin', 'Administrador');
}

// Seed: médicos
const medicoCount = db.prepare('SELECT COUNT(*) as c FROM MEDICO').get();
if (medicoCount.c === 0) {
    const ins = db.prepare('INSERT INTO MEDICO (nome, crm, especialidade, telefone, email) VALUES (?, ?, ?, ?, ?)');
    ins.run('Dr. Carlos Silva',    'CRM/SP 12345', 'Clínico Geral', '(11) 9999-0001', 'carlos.silva@clinica.com');
    ins.run('Dra. Ana Souza',      'CRM/SP 54321', 'Cardiologia',   '(11) 9999-0002', 'ana.souza@clinica.com');
    ins.run('Dr. Pedro Oliveira',  'CRM/SP 99887', 'Pediatria',     '(11) 9999-0003', 'pedro.oliveira@clinica.com');
    ins.run('Dra. Fernanda Lima',  'CRM/SP 77665', 'Ortopedia',     '(11) 9999-0004', 'fernanda.lima@clinica.com');
}

// Seed: pacientes
const pacienteCount = db.prepare('SELECT COUNT(*) as c FROM PACIENTE').get();
if (pacienteCount.c === 0) {
    const ins = db.prepare('INSERT INTO PACIENTE (nome, cpf, telefone, email, data_nascimento) VALUES (?, ?, ?, ?, ?)');
    ins.run('João Pereira',    '123.456.789-00', '(11) 98765-4321', 'joao@email.com',  '1985-03-15');
    ins.run('Maria Santos',    '987.654.321-00', '(11) 91234-5678', 'maria@email.com', '1992-07-20');
    ins.run('Lucas Ferreira',  '456.789.123-00', '(11) 99876-5432', 'lucas@email.com', '1990-11-05');
    ins.run('Carla Mendes',    '321.654.987-00', '(11) 97654-3210', 'carla@email.com', '1998-01-25');
}

// Seed: consultas
const consultaCount = db.prepare('SELECT COUNT(*) as c FROM CONSULTA').get();
if (consultaCount.c === 0) {
    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    const d1 = fmt(today);
    const d2 = fmt(new Date(today.getTime() + 86400000));
    const d3 = fmt(new Date(today.getTime() + 172800000));
    const d0 = fmt(new Date(today.getTime() - 86400000));

    const ins = db.prepare('INSERT INTO CONSULTA (data, hora, status, motivo, id_medico, id_paciente) VALUES (?, ?, ?, ?, ?, ?)');
    ins.run(d1,  '08:00', 'agendada',  'Consulta de rotina',     1, 1);
    ins.run(d1,  '09:30', 'agendada',  'Dor no peito',           2, 2);
    ins.run(d2,  '10:00', 'agendada',  'Febre persistente',      3, 3);
    ins.run(d3,  '14:00', 'agendada',  'Dor no joelho',          4, 4);
    ins.run(d0,  '08:00', 'realizada', 'Check-up anual',         1, 2);
    ins.run(d0,  '11:00', 'cancelada', 'Retorno cardiológico',   2, 1);
}

module.exports = db;
