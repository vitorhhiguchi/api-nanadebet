# nanadebets

API simples de apostas usando Node.js, Express e MySQL via Sequelize.
**Com criptografia assimétrica RSA 2048 bits + AES-256.**

## Estrutura principal

- `server.js` - inicializa o servidor Express
- `src/app/app.js` - configura middleware e rotas
- `src/app/routes/apostasRoute.js` - define rotas REST para apostas
- `src/app/routes/cryptoRoute.js` - define rotas de criptografia
- `src/app/controllers/apostasController.js` - implementa o CRUD de apostas
- `src/app/controllers/cryptoController.js` - endpoints de criptografia
- `src/app/crypto/rsaKeys.js` - geração e gerenciamento do par de chaves RSA
- `src/app/crypto/cryptoUtils.js` - funções de cifrar/decifrar (híbrida RSA+AES)
- `src/app/middleware/decryptMiddleware.js` - middleware de decifração automática
- `src/app/database/mysql.js` - configura a conexão Sequelize com MySQL
- `src/app/database/aposta.js` - define o model `apostas`

## Pré-requisitos

- Node.js instalado
- MySQL rodando
- Banco de dados MySQL criado para este projeto

## Dependências

- `express`
- `sequelize`
- `mysql2`
- `dotenv`
- `nodemon` (dev)
- `crypto` (módulo nativo do Node.js, não precisa instalar)

## Configuração

1. Copie ou crie um arquivo `.env` na raiz do projeto.
2. Atualize com os dados do seu MySQL:

```env
DATABASE_NAME=nanadebets
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=
DATABASE_PORT=3306
```

> O arquivo `.env` deve conter o nome e as credenciais do banco. O Sequelize sincroniza apenas as tabelas, não cria o banco de dados.

## Criar o banco de dados

Antes de rodar a API, crie o banco `nanadebets` no MySQL

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

---

## Criptografia — Segurança na API

### Qual algoritmo está sendo usado?

**RSA (Rivest-Shamir-Adleman)** para criptografia assimétrica, combinado com **AES-256-CBC** para criptografia simétrica dos dados (abordagem híbrida).

### Quantos bits o algoritmo usa?

- **RSA: 2048 bits** (tamanho do módulo — recomendado pelo NIST como mínimo seguro)
- **AES: 256 bits** (tamanho da chave simétrica de sessão)
- **IV (Vetor de Inicialização): 128 bits** (16 bytes, usado pelo AES-CBC)

### O que é que tem por trás disso?

#### Criptografia Simétrica vs Assimétrica

| Característica | Simétrica (AES) | Assimétrica (RSA) |
|---|---|---|
| Chaves | 1 chave secreta compartilhada | 2 chaves (pública + privada) |
| Velocidade | Rápida | Lenta |
| Segurança para troca | Menos segura (precisa trocar a chave) | Mais segura (chave pública é aberta) |
| Uso ideal | Cifrar grandes volumes de dados | Trocar chaves, assinaturas digitais |

#### Como o RSA funciona (fundamento matemático)

1. **Gerar dois primos grandes** `p` e `q`
2. **Calcular** `n = p × q` (módulo) — este `n` faz parte das duas chaves
3. **Calcular** `φ(n) = (p-1) × (q-1)` (função totiente de Euler)
4. **Escolher** `e` (expoente público, geralmente 65537)
5. **Calcular** `d` tal que `d × e ≡ 1 (mod φ(n))` (expoente privado)

- **Chave pública**: `(n, e)` — pode ser compartilhada com qualquer um
- **Chave privada**: `(n, d)` — deve ser mantida em segredo

**Para cifrar**: `c = m^e mod n`
**Para decifrar**: `m = c^d mod n`

A **segurança** se baseia no fato de que é computacionalmente inviável fatorar `n` para descobrir `p` e `q` quando estes são primos muito grandes (1024 bits cada, no caso do RSA-2048).

#### Por que usamos abordagem híbrida (RSA + AES)?

O RSA 2048 com padding OAEP só consegue cifrar até **~190 bytes** diretamente. Para dados maiores (como o body de uma requisição JSON), usamos:

1. **AES-256-CBC** para cifrar os dados (rápido, sem limite de tamanho)
2. **RSA** apenas para cifrar a chave AES de sessão (32 bytes)

Isso combina a **segurança do RSA** (troca segura de chaves) com a **velocidade do AES** (cifrar dados).

### Fluxo da criptografia na API

```
Cliente                                     Servidor
  |                                            |
  |  1. GET /crypto/public-key                 |
  |  ----------------------------------------> |
  |  <-- Chave pública RSA (PEM)               |
  |                                            |
  |  2. Gera chave AES aleatória               |
  |     Cifra dados com AES                    |
  |     Cifra chave AES com RSA (chave pública)|
  |                                            |
  |  3. POST /apostas                          |
  |     Header: X-Encrypted: true              |
  |     Body: { encryptedKey, iv,              |
  |             encryptedData }                |
  |  ----------------------------------------> |
  |                                            |
  |         4. Servidor decifra chave AES      |
  |            com chave privada RSA           |
  |            Decifra dados com AES           |
  |            Processa requisição             |
  |                                            |
  |  <-- Resposta normal (201 Created)         |
  |                                            |
```

---

## Endpoints

### Apostas (CRUD)

> [!IMPORTANT]
> **Modo Tolerância Zero**: Todas as rotas de `/apostas` exigem obrigatoriamente o envio do header `X-Encrypted: true`. Requisições sem este header serão rejeitadas com erro 403.

#### Listar apostas

- `GET /apostas`
- Header obrigatório: `X-Encrypted: true`

#### Criar aposta

- `POST /apostas`
- Header obrigatório: `X-Encrypted: true`
- Corpo JSON (obrigatoriamente cifrado):

```json
{
  "encryptedKey": "(chave AES cifrada com RSA, base64)",
  "iv": "(vetor de inicialização, base64)",
  "encryptedData": "(dados cifrados com AES, base64)"
}
```

#### Atualizar valor da aposta

- `PUT /apostas/:id`
- Apenas o campo `valor` é atualizado

```json
{
  "valor": 200.0
}
```

#### Deletar aposta

- `DELETE /apostas/:id`

### Criptografia

#### Obter chave pública

- `GET /crypto/public-key`
- Retorna a chave pública RSA em formato PEM

#### Informações da criptografia

- `GET /crypto/info`
- Retorna explicação completa sobre os algoritmos, bits e funcionamento

#### Cifrar dados (demonstração)

- `POST /crypto/encrypt`
- Envia qualquer JSON e recebe os dados cifrados

#### Decifrar dados (demonstração)

- `POST /crypto/decrypt`
- Envia os dados cifrados e recebe os dados originais

---

## Notas importantes

- O endpoint `PUT /apostas/:id` só atualiza o campo `valor`.
- Se você quiser acessar a API de outro computador na mesma rede, use o IP da máquina que está rodando o servidor, por exemplo `http://172.16.3.6:3000/apostas`, e garanta que a porta 3000 esteja liberada.
- O Sequelize cria/sincroniza a tabela `apostas` automaticamente, mas o banco `nanadebets` deve existir antes.
- As chaves RSA são geradas automaticamente na primeira execução e salvas na pasta `keys/` na raiz do projeto (`keys/private.pem` e `keys/public.pem`).
- **Como usar suas próprias chaves:** Se você já possui um par de chaves RSA de 2048 bits em formato PEM, basta substituir os arquivos `keys/private.pem` e `keys/public.pem` pelos seus. A API passará a usar as suas chaves automaticamente ao reiniciar.
- A pasta `keys/` está no `.gitignore` para não vazar a chave privada no controle de versão.
- O módulo `crypto` é nativo do Node.js, não precisa instalar nenhuma dependência extra.

## Teste com Postman

### Teste das Rotas (Requer Criptografia)

1. `GET http://localhost:3000/crypto/public-key` — obter a chave pública
2. `POST http://localhost:3000/crypto/encrypt` — cifrar dados de teste
3. `POST http://localhost:3000/crypto/decrypt` — decifrar os dados
4. `POST http://localhost:3000/apostas` com header `X-Encrypted: true` e body cifrado
5. `GET http://localhost:3000/crypto/info` — ver explicação completa
