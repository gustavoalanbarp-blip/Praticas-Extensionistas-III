# ClinicaMS — Sistema de Agendamento de Consultas Clínicas

**Práticas Extensionistas III — Entrega 2**
**Autor:** Gustavo Alan Barp

---

## Sobre o Projeto

Sistema web completo para gerenciamento e agendamento de consultas em clínicas médicas. Desenvolvido com Node.js, Express e SQLite como MVP funcional.

## Tecnologias

| Camada     | Tecnologia |
|------------|------------|
| Backend    | Node.js + Express |
| Banco      | SQLite (better-sqlite3) |
| Frontend   | HTML5 + CSS3 + JavaScript (Vanilla) |
| Ícones     | Font Awesome 6 |
| Autenticação | express-session + bcryptjs |

## Modelo Relacional (Atualizado — Entrega 2)

```
USUARIO (id_usuario PK, email UNIQUE, senha, tipo, nome)

MEDICO (id_medico PK, nome, crm UNIQUE, especialidade, telefone, email, ativo)

PACIENTE (id_paciente PK, nome, cpf UNIQUE, telefone, email, data_nascimento, ativo)

CONSULTA (id_consulta PK,
          data, hora, status, motivo, prontuario,
          id_medico FK → MEDICO,
          id_paciente FK → PACIENTE)

CONTATO (id_contato PK, nome, email, assunto, mensagem, enviado_em)
```

> O schema SQL completo está em `app/database/schema.sql`

### Alterações em relação à Entrega 1

- **MEDICO**: adicionados `especialidade`, `telefone`, `email`, `ativo`
- **PACIENTE**: adicionados `telefone`, `email`, `data_nascimento`, `ativo`
- **CONSULTA**: `REALIZA` + `AGENDA` consolidadas em uma tabela com FKs diretas; adicionados `status`, `motivo`, `prontuario`
- **USUARIO** (nova): autenticação com senha criptografada
- **CONTATO** (nova): armazena mensagens do formulário de contato

## Como Executar

```bash
cd app
npm install
npm start
```

Acesse: **http://localhost:3000**

**Credenciais padrão:**
- Email: `admin@clinica.com`
- Senha: `admin123`

## Interfaces Implementadas

| Interface | Rota | Descrição |
|-----------|------|-----------|
| Landing Page | `/` | Página principal pública com apresentação do sistema |
| Login | `/login.html` | Autenticação com e-mail e senha |
| Dashboard | `/dashboard.html` | Visão geral com estatísticas e próximas consultas |
| Pacientes | `/pacientes.html` | CRUD completo de pacientes |
| Médicos | `/medicos.html` | CRUD completo de médicos |
| Consultas | `/consultas.html` | CRUD de consultas com detecção de conflito de horário |
| Relatório | `/relatorio.html` | Pesquisa e relatório com filtros avançados e impressão |
| Contato | `/contato.html` | Formulário de contato com os desenvolvedores |

## API REST

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/pacientes          (+ ?search=)
POST   /api/pacientes
PUT    /api/pacientes/:id
DELETE /api/pacientes/:id

GET    /api/medicos            (+ ?search=)
POST   /api/medicos
PUT    /api/medicos/:id
DELETE /api/medicos/:id

GET    /api/consultas          (+ ?data_inicio, data_fim, id_medico, id_paciente, status, search)
GET    /api/consultas/stats
POST   /api/consultas
PUT    /api/consultas/:id
DELETE /api/consultas/:id      (cancela)

POST   /api/contato
```

## Estrutura de Pastas

```
Praticas-Extensionistas-III/
├── app/
│   ├── server.js
│   ├── package.json
│   ├── database/
│   │   ├── db.js          (inicialização + seed)
│   │   └── schema.sql     (modelo relacional documentado)
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pacientes.js
│   │   ├── medicos.js
│   │   ├── consultas.js
│   │   └── contato.js
│   └── public/
│       ├── index.html      (landing page)
│       ├── login.html
│       ├── dashboard.html
│       ├── pacientes.html
│       ├── medicos.html
│       ├── consultas.html
│       ├── relatorio.html
│       ├── contato.html
│       ├── css/style.css
│       └── js/common.js
└── doc/
    ├── Modelo_Conceitual.png
    ├── Modelo_Logico.png
    ├── Diagrama de Casos de Uso.png
    ├── Diagrama de Classes.png
    ├── Diagrama de Atividades.png
    └── Diagrama_Sequencia.png
```

## Funcionalidades de Destaque

- **Conflito de horário**: ao agendar, verifica automaticamente se o médico já tem consulta naquele horário
- **Soft delete**: pacientes e médicos são desativados (não excluídos) para manter integridade referencial
- **Sessão segura**: senha armazenada com bcrypt, sessão expira em 8h
- **Relatório imprimível**: página de relatório tem suporte a impressão (CSS @media print)
- **Dados de exemplo**: banco é semeado automaticamente com 4 médicos, 4 pacientes e 6 consultas
