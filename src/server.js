const app = 'app/app.js';

const PORT = 3000;

app.listen(PORT, '172.16.3.6', () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});