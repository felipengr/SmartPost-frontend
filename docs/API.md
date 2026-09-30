# API Smart Poste — contrato v1

Documento de referência entre o app (este repositório) e o backend (repositório separado).
Tudo que o app precisa do servidor está aqui. **Mudou algo na API? Atualize este arquivo no mesmo PR.**

- **Base URL:** `https://<host>/v1`
- **Formato:** JSON (`Content-Type: application/json`), exceto o envio de foto (multipart).
- **Datas:** texto ISO 8601 em UTC — ex.: `"2026-09-28T19:03:00.000Z"`.
- **Nomes de campos:** `camelCase`. Valores de enum: `snake_case` (iguais aos de `src/types.ts`).
- **Autenticação:** JWT no header `Authorization: Bearer <token>`.

## Stack sugerida (custo zero)

| Parte | Escolha | Por quê |
|---|---|---|
| API | Node.js + TypeScript + **Fastify** | Rápido, tipado, pouco código de boilerplate |
| Validação | **zod** | Mesmo schema valida a entrada e gera os tipos |
| Banco | **PostgreSQL** + **Prisma** | ORM com migrations; Postgres roda local via Docker |
| Senhas | **argon2** (ou bcrypt) | Nunca guardar senha em texto |
| Fotos | **Cloudinary** (free) | Recebe o upload e devolve uma URL pública |
| Hospedagem | **Render** (API, free) + **Neon** (Postgres, free) | Sem cartão de crédito. No Render a API "dorme" após 15 min sem uso |

## Papéis de usuário

| Papel | Quem é | Pode |
|---|---|---|
| `cidadao` | Morador cadastrado pela prefeitura | Logar no app, ver o feed, criar denúncias |
| `gestor` | Funcionário da prefeitura | Tudo do cidadão + cadastrar cidadãos e mudar status (painel web) |

Não existe cadastro aberto: contas são criadas por um `gestor`.

## Endpoints

Resumo — detalhes de cada um logo abaixo.

| Método | Rota | Auth | Usado em |
|---|---|---|---|
| `GET` | `/municipios` | — | Tela 02 (selecionar município) |
| `POST` | `/auth/login` | — | Tela 03 (login) |
| `GET` | `/me` | cidadão | Tela 07 (perfil) |
| `PATCH` | `/me/senha` | cidadão | Perfil → Alterar senha |
| `GET` | `/denuncias` | cidadão | Tela 04 (feed) |
| `GET` | `/denuncias/minhas` | cidadão | Perfil → Minhas denúncias |
| `GET` | `/denuncias/:id` | cidadão | Detalhe de uma denúncia |
| `POST` | `/denuncias` | cidadão | Telas 05 → 06 → 08 (nova denúncia) |
| `PATCH` | `/denuncias/:id/status` | gestor | Painel da prefeitura |
| `POST` | `/usuarios` | gestor | Painel da prefeitura |

### `GET /municipios`

Lista os municípios conveniados. Público (é chamado antes do login).

**200**
```json
[
  { "id": "piracaia", "nome": "Piracaia", "uf": "SP", "estado": "São Paulo" }
]
```

### `POST /auth/login`

```json
{ "municipioId": "piracaia", "cpf": "123.456.789-01", "senha": "••••••••" }
```

- O CPF pode vir com ou sem máscara; o servidor guarda e compara só os dígitos.
- O usuário precisa pertencer ao `municipioId` informado.

**200**
```json
{
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": "u_01J...",
    "nome": "Felipe Nogueira",
    "papel": "cidadao",
    "municipio": { "id": "piracaia", "nome": "Piracaia", "uf": "SP", "estado": "São Paulo" }
  }
}
```

**401** `CREDENCIAIS_INVALIDAS` — mesma resposta para CPF inexistente e senha errada (não revelar qual dos dois falhou).

> O token expira em 30 dias. O app guarda o token com `expo-secure-store`; ao receber 401 em qualquer rota (fora o próprio login), volta para o login.

### `GET /me`

Dados do usuário logado e as estatísticas do perfil.

**200**
```json
{
  "id": "u_01J...",
  "nome": "Felipe Nogueira",
  "papel": "cidadao",
  "municipio": { "id": "piracaia", "nome": "Piracaia", "uf": "SP", "estado": "São Paulo" },
  "estatisticas": { "denuncias": 12 }
}
```

`estatisticas.denuncias` é o total de denúncias feitas pelo próprio usuário, em qualquer status. O CPF **não** é devolvido.

### `PATCH /me/senha`

```json
{ "senhaAtual": "••••", "novaSenha": "••••••••" }
```

**204** sem corpo · **403** `SENHA_INCORRETA` · **422** se `novaSenha` tiver menos de 8 caracteres.

> É 403, e não 401, de propósito: 401 faz o app voltar para o login, e errar a senha atual não deve deslogar ninguém.

### `GET /denuncias`

Feed do município do usuário logado, mais recentes primeiro. Paginado por cursor.

| Query | Obrigatório | Descrição |
|---|---|---|
| `limite` | não | Padrão 20, máximo 50 |
| `cursor` | não | Valor de `proximoCursor` da página anterior |
| `lat`, `lng` | não | Posição do usuário; se enviados, cada item vem com `distanciaKm` |

**200**
```json
{
  "itens": [
    {
      "id": "d_01J...",
      "protocolo": "SP-0248",
      "endereco": "Rua Dr. Cândido Rodrigues",
      "latitude": -23.0538,
      "longitude": -46.3581,
      "criadaEm": "2026-09-28T19:03:00.000Z",
      "tipos": ["fio_exposto", "sem_energia"],
      "status": "recebida",
      "descricao": "Fio rompido próximo à calçada.",
      "fotoUrl": "https://res.cloudinary.com/.../d_01J.jpg",
      "distanciaKm": 1.2,
      "minha": true
    }
  ],
  "proximoCursor": "eyJpZCI6..."
}
```

- `proximoCursor` é `null` na última página.
- `distanciaKm` é `null` quando `lat`/`lng` não forem enviados.
- `minha` indica se a denúncia é do usuário logado. **Nunca** expor nome ou CPF de quem denunciou.

### `GET /denuncias/minhas`

Mesmo formato e paginação de `GET /denuncias`, filtrado pelo autor = usuário logado.

### `GET /denuncias/:id`

**200** um item no mesmo formato do feed · **404** `NAO_ENCONTRADA` (inclusive se for de outro município).

### `POST /denuncias`

`multipart/form-data`:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `foto` | arquivo JPEG | sim | Até 5 MB. O servidor confere o conteúdo (não só a extensão), limita a 1600 px e remove os metadados EXIF (GPS, aparelho) |
| `tipos` | texto (repetido) | sim | Um ou mais de `TipoProblema`. Ex.: `tipos=fio_exposto&tipos=sem_energia`. Repetições são ignoradas |
| `descricao` | texto | não | Até 300 caracteres |
| `latitude`, `longitude` | número | sim | Da localização do aparelho |
| `endereco` | texto | sim | Obtido no app via `expo-location` (reverse geocode) |

- O servidor gera `id`, `protocolo`, `criadaEm` e `status = "recebida"`.
- O município é o do usuário logado (não vem do app).

**201** o item criado, no mesmo formato do feed · **422** `DADOS_INVALIDOS` · **400** `REQUISICAO_INVALIDA` se o corpo não for `multipart/form-data`.

Exemplos de `campos` no 422: `{ "foto": "obrigatório" }`, `{ "foto": "a foto deve ser JPEG" }`, `{ "foto": "máximo de 5 MB" }`, `{ "tipos": "selecione ao menos um tipo" }`, `{ "latitude": "obrigatório" }`.

> O app hoje só manda a foto e os tipos; localização e endereço entram na integração (`expo-location`).

### `PATCH /denuncias/:id/status` — gestor

```json
{ "status": "em_analise" }
```

**200** o item atualizado · **403** `SEM_PERMISSAO` se não for `gestor` do mesmo município.

Transições válidas: `recebida → em_analise → resolvida`. O servidor registra cada mudança (quem e quando) em um histórico.

### `POST /usuarios` — gestor

```json
{ "nome": "Maria Souza", "cpf": "987.654.321-00", "senhaInicial": "••••••••", "papel": "cidadao" }
```

- Cria o usuário no município do gestor (o município não vem no corpo).
- `cpf` com ou sem máscara; precisa ter dígitos verificadores válidos (CPFs como `111.111.111-11` são recusados).
- `nome` de 3 a 120 caracteres · `senhaInicial` de 8 a 128 · `papel` é `cidadao` ou `gestor`.

**201**, sem senha e sem CPF:
```json
{
  "id": "u_01J...",
  "nome": "Maria Souza",
  "papel": "cidadao",
  "municipio": { "id": "piracaia", "nome": "Piracaia", "uf": "SP", "estado": "São Paulo" }
}
```

**403** `SEM_PERMISSAO` se quem chama não for `gestor` · **409** `CPF_JA_CADASTRADO` se o CPF já existir no município · **422** `DADOS_INVALIDOS`.

## Enums

```ts
type TipoProblema = 'fio_exposto' | 'sem_energia' | 'sem_internet' | 'sem_telefone' | 'risco_populacao';
type StatusDenuncia = 'recebida' | 'em_analise' | 'resolvida';
type Papel = 'cidadao' | 'gestor';
```

Os textos exibidos ("Fio rompido / exposto", "Em análise"…) ficam no app, não na API.

## Erros

Todo erro segue o mesmo formato:

```json
{ "erro": { "codigo": "DADOS_INVALIDOS", "mensagem": "Selecione ao menos um tipo de problema.", "campos": { "tipos": "obrigatório" } } }
```

| HTTP | `codigo` | Quando |
|---|---|---|
| 400 | `REQUISICAO_INVALIDA` | JSON malformado, query inválida, formulário que não é multipart |
| 401 | `NAO_AUTENTICADO` | Sem token, token inválido ou expirado |
| 401 | `CREDENCIAIS_INVALIDAS` | Login falhou |
| 403 | `SEM_PERMISSAO` | Papel ou município não permitem a ação |
| 403 | `SENHA_INCORRETA` | Senha atual errada ao trocar a senha |
| 404 | `NAO_ENCONTRADA` | Recurso não existe (ou é de outro município) |
| 409 | `CPF_JA_CADASTRADO` | CPF repetido no cadastro |
| 422 | `DADOS_INVALIDOS` | Validação falhou; `campos` diz o quê |
| 500 | `ERRO_INTERNO` | Qualquer outro problema — sem detalhes técnicos na resposta |

`mensagem` é em português e pode ser mostrada direto ao usuário. `campos` só aparece em 422.

## Modelo de dados (referência para o backend)

```
municipios   id (slug) · nome · uf · estado · prefixo_protocolo ("SP") · ultimo_protocolo
usuarios     id · municipio_id → municipios · cpf (só dígitos) · nome · senha_hash · papel · criado_em
             único: (municipio_id, cpf)
denuncias    id · municipio_id → municipios · autor_id → usuarios · protocolo · tipos (text[]) · status
             descricao · foto_url · latitude · longitude · endereco · criada_em · atualizada_em
             único: protocolo
historico_status   id · denuncia_id → denuncias · de · para · gestor_id → usuarios · em
```

- **Protocolo:** `<prefixo_protocolo>-<sequencial de 4 dígitos por município>` — ex.: `SP-0248`. O sequencial vem de `ultimo_protocolo`, incrementado na mesma transação que cria a denúncia; denúncias simultâneas nunca repetem número.
- **Distância:** fórmula de Haversine a partir de `latitude`/`longitude`, calculada na API para os itens da página. PostGIS não é necessário neste volume.

## Fora do escopo da v1

- "Esqueci minha senha" por e-mail/SMS — por enquanto o app orienta procurar a prefeitura.
- Editar perfil (nome/foto).
- Filtros no feed (por tipo, status, período).
- Notificações push quando o status muda.
