# nanadebets

API simples de apostas usando Node.js, Express e PostgreSQL via Sequelize.

## Estrutura principal

- `server.js` - inicializa o servidor Express
- `src/app/app.js` - configura middleware e rotas
- `src/app/routes/apostasRoute.js` - define rotas REST para apostas
- `src/app/controllers/apostasController.js` - implementa o CRUD de apostas
- `src/app/database/mysql.js` - configura a conexão Sequelize com PostgreSQL
- `src/app/database/aposta.js` - define o model `apostas`

## Pré-requisitos

- Node.js instalado
- PostgreSQL rodando (você já tem no Docker)
- Banco de dados PostgreSQL criado para este projeto

## Dependências

- `express`
- `sequelize`
- `pg`
- `dotenv`
- `nodemon` (dev)

## Configuração

1. Copie ou crie um arquivo `.env` na raiz do projeto.
2. Atualize com os dados do seu PostgreSQL:

```env
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=
DATABASE_PORT=
```

> O arquivo `.env` deve conter o nome e as credenciais do banco. O Sequelize sincroniza apenas as tabelas, não cria o banco de dados.

## Criar o banco de dados

Antes de rodar a API, crie o banco `nanadebets` no PostgreSQL

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

A API deve subir em `http://localhost:3000`. 
Ou na PORTA que voce deixar exposto.

## Endpoints

### Listar apostas

- `GET /apostas`

### Criar aposta

- `POST /apostas`
- Corpo JSON:

```json
{
  "idApostador": 1,
  "valor": 150.50,
  "idLuta": 1,
  "idLutador1": 10,
  "idLutador2": 20
}
```

### Atualizar valor da aposta

- `PUT /apostas/:id`
- Apenas o campo `valor` é atualizado

```json
{
  "valor": 200.00
}
```

### Deletar aposta

- `DELETE /apostas/:id`

## Notas importantes

- O endpoint `PUT /apostas/:id` só atualiza o campo `valor`.
- Se você quiser acessar a API de outro computador na mesma rede, use o IP da máquina que está rodando o servidor, por exemplo `http://172.16.3.6:3000/apostas`, e garanta que a porta 3000 esteja liberada.
- O Sequelize cria/sincroniza a tabela `apostas` automaticamente, mas o banco `nanadebets` deve existir antes.

## Teste com Postman

- `GET http://localhost:3000/apostas`
- `POST http://localhost:3000/apostas` com `Content-Type: application/json`
- `PUT http://localhost:3000/apostas/1` com JSON `{ "valor": 200.00 }`
- `DELETE http://localhost:3000/apostas/1`
