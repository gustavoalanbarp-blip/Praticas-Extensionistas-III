-- ============================================================
-- MODELO RELACIONAL - SISTEMA DE AGENDAMENTO DE CONSULTAS
-- Praticas Extensionistas III - Entrega 2 (Atualizado)
-- Autor: Gustavo Alan Barp
-- ============================================================

-- Tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS USUARIO (
    id_usuario    INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    NOT NULL UNIQUE,
    senha         TEXT    NOT NULL,
    tipo          TEXT    NOT NULL DEFAULT 'admin',
    nome          TEXT,
    criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de médicos (atualizada: + especialidade, telefone, email, ativo)
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

-- Tabela de pacientes (atualizada: + telefone, email, data_nascimento, ativo)
CREATE TABLE IF NOT EXISTS PACIENTE (
    id_paciente    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome           TEXT    NOT NULL,
    cpf            TEXT    NOT NULL UNIQUE,
    telefone       TEXT,
    email          TEXT,
    data_nascimento TEXT,
    ativo          INTEGER NOT NULL DEFAULT 1,
    criado_em      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de consultas (materializa REALIZA + AGENDA em uma tabela com FKs)
-- Atualizada: + status, motivo, prontuario, chaves estrangeiras diretas
CREATE TABLE IF NOT EXISTS CONSULTA (
    id_consulta   INTEGER PRIMARY KEY AUTOINCREMENT,
    data          TEXT    NOT NULL,
    hora          TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'agendada'
                              CHECK(status IN ('agendada','realizada','cancelada')),
    motivo        TEXT,
    prontuario    TEXT,
    id_medico     INTEGER NOT NULL,
    id_paciente   INTEGER NOT NULL,
    criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medico)   REFERENCES MEDICO(id_medico)   ON DELETE RESTRICT,
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente) ON DELETE RESTRICT
);

-- Tabela de mensagens de contato (nova)
CREATE TABLE IF NOT EXISTS CONTATO (
    id_contato    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT    NOT NULL,
    email         TEXT    NOT NULL,
    assunto       TEXT    NOT NULL,
    mensagem      TEXT    NOT NULL,
    enviado_em    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_consulta_medico   ON CONSULTA(id_medico);
CREATE INDEX IF NOT EXISTS idx_consulta_paciente ON CONSULTA(id_paciente);
CREATE INDEX IF NOT EXISTS idx_consulta_data     ON CONSULTA(data);
CREATE INDEX IF NOT EXISTS idx_consulta_status   ON CONSULTA(status);
