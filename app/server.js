const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'clinicams-secret-2024-praticas-extensionistas',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 horas
}));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/pacientes', require('./routes/pacientes'));
app.use('/api/medicos',   require('./routes/medicos'));
app.use('/api/consultas', require('./routes/consultas'));
app.use('/api/contato',   require('./routes/contato'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  ClinicaMS rodando em: http://localhost:${PORT}`);
    console.log(`  Login padrão: admin@clinica.com / admin123\n`);
});
