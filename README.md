# API Backend - Documentação

Este documento descreve o backend de uma aplicação de gerenciamento de ordens de serviço e cadastro de clientes, incluindo rotas, configurações e funcionalidades implementadas. Esta aplicação é construída usando Node.js com o framework Express e Supabase como banco de dados.

## Índice
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Rotas](#rotas)
  - [Produto - /produto/:id](#produto---produtoid)
  - [Ordem específica do cliente - /cliente/:clienteId/ordem/:ordemId](#ordem-específica-do-cliente---clienteclienteidordemordemid)
  - [Últimas ordens - /ultimas-ordens](#últimas-ordens---ultimas-ordens)
  - [Categorias - /categoria](#categorias---categoria)
  - [Status - /status](#status---status)
  - [Administradores - /admins](#administradores---admins)
  - [Pesquisa de cliente - /pesquisa/:search](#pesquisa-de-cliente---pesquisasearch)
  - [Cadastro de cliente e ordem - /cliente-e-ordem](#cadastro-de-cliente-e-ordem---cliente-e-ordem)
  - [Adicionar ordem a cliente - /cliente/:id/ordem](#adicionar-ordem-a-cliente---clienteidordem)
  - [Atualizar ordem de serviço - /cliente/:clienteId/ordem/:ordemId](#atualizar-ordem-de-serviço---clienteclienteidordemordemid)
  - [Registrar administrador - /register-admin](#registrar-administrador---register-admin)
- [Dependências](#dependências)
- [Funções Auxiliares](#funções-auxiliares)

## Instalação
1. Clone o repositório:
```bash
   git clone <URL-do-repositório>
   cd <nome-do-repositório>
```

2. Instale as dependências:
```bash
    npm install
```

3. Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
```plaintext
    JWT_SECRET=your_secret_key
```

4.Inicie o servidor:
```bash
    npm start
```

## Configuração
* JWT: Usado para autenticação de administradores com tokens expiram em uma hora.
* Supabase: Cliente de banco de dados configurado para conectar com tabelas específicas.

## Rotas

### Produto -```/produto/:id```
#### Retorna todas as ordens associadas a um cliente específico.

* Método: ```GET```
* Parâmetro: ```id``` - ID do cliente
* Resposta:
    * 200 OK: Objeto JSON com cliente e ordens associadas.
    * 404 Not Found: Cliente ou ordens não encontrados.
    * 500 Internal Server Error: Erro de execução.

### Ordem específica do cliente - ```/cliente/:clienteId/ordem/:ordemId```
#### Busca uma ordem específica de um cliente.

* Método: ```GET```
* Parâmetros:
    * ```clienteId```: ID do cliente
    * ```ordemId```: ID da ordem
* Resposta:
    * ```200 OK```: Objeto JSON com detalhes do cliente e ordem.
    * ```404 Not Found```: Cliente ou ordem não encontrados.
    * ```500 Internal Server Error```: Erro de execução.

### Últimas ordens - ```/ultimas-ordens```
#### Lista as últimas ordens, agrupadas por cliente.

* Método: ```GET```
* Resposta:
    * ```200 OK```: Lista de clientes e suas ordens mais recentes.
    * ```500 Internal Server Error```: Erro de execução.

### Categorias - ```/categoria```
#### Retorna todas as categorias de produtos.

* Método: ```GET```
* Resposta:
    * ```200 OK```: Lista de categorias.
    * ```500 Internal Server Error```: Erro de execução.

### Status - ```/status```
#### Retorna todos os status possíveis para ordens de serviço.

* Método: ```GET```
* Resposta:
    * ```200 OK```: Lista de categorias.
    * ```500 Internal Server Error```: Erro de execução.

### Administradores - ```/admins```
#### Retorna todos os administradores cadastrados.

* Método: ```GET```
* Resposta:
    * ```200 OK```: Lista de categorias.
    * ```500 Internal Server Error```: Erro de execução.

### Pesquisa de cliente - ```/pesquisa/:search```
#### Pesquisa clientes por CPF, nome ou telefone.

* Método: ```GET```
* Parâmetro: search - termo de pesquisa
* Resposta:
    * ```200 OK```: Lista de categorias.
    * ```404 Not Found```: Cliente não encontrado.
    * ```500 Internal Server Error```: Erro de execução.

### Cadastro de cliente e ordem - ```/cliente-e-ordem```
#### Cadastra um cliente e uma ordem de serviço associada.

* Método: ```POST```
* Corpo da Requisição:
    * ```nome```, ```telefone```, ```endereco```, ```cpf```, ```info_produto```, ```defeito```, ```solucao```, ```fk_categoria_id```, ```fk_status_id```, ```orcamento```
* Resposta:
    * ```201 Created```: Objeto JSON com cliente e ordem criados.
    * ```500 Internal Server Error```: Erro de execução.

### Adicionar ordem a cliente - ```/cliente/:id/ordem```
#### Adiciona uma nova ordem a um cliente existente.

* Método: ```POST```
* Parâmetros: ```id``` - ID do cliente
* Corpo da Requisição:
    * ```info_produto```, ```defeito```, ```solucao```, ```fk_categoria_id```, ```fk_status_id```, ```orcamento```
* Resposta:
    * ```201 Created```: Objeto JSON com cliente e ordem criados.
    * ```404 Not Found```: Cliente não encontrado.
    * ```500 Internal Server Error```: Erro de execução.

### Atualizar ordem de serviço - ```/cliente/:clienteId/ordem/:ordemId```
#### Atualiza uma ordem de serviço específica de um cliente.

* Método: ```PUT```
* Parâmetros:
    * ```clienteId```: ID do cliente
    * ```ordemId```: ID da ordem
* Corpo da Requisição:
    * ```info_produto```, ```defeito```, ```solucao```, ```fk_status_id```, ```orcamento```
* Resposta:
    * ```200 OK```: JSON com mensagem de sucesso e dados atualizados.
    * ```404 Not Found```: Cliente ou ordem não encontrados.
    * ```500 Internal Server Error```: Erro de execução.

### Registrar administrador - ```/register-admin```
#### Cadastra um novo administrador.

* Método: ```POST```
* Corpo da Requisição:
    * ```nome```, ```email```, ```senha```
* Resposta:
    * ```201 Created```: JSON com dados do administrador.
    * ```400 Bad Request```: Email já em uso.
    * ```500 Internal Server Error```: Erro de execução.

## Dependências
    * Express: Servidor web.
    * Moment: Manipulação de datas.
    * CORS: Configuração de permissão de origens cruzadas.
    * Bcrypt: Hash de senhas.
    * JWT: Autenticação com tokens.
    * UUID: Gerador de identificadores únicos.
    * Supabase: Cliente de banco de dados.

## Funções Auxiliares
```js
    generateToken(params)
```
Gera um token JWT com validade de 1 hora.

**Parâmetros**: ```params``` - Objeto com os dados do payload do token.

**Retorno**: Token JWT.

Esta documentação serve como guia para desenvolvedores integrarem e darem manutenção na API, bem como para clientes entenderem o funcionamento das rotas disponíveis.
>Esse arquivo de documentação deve cobrir todas as rotas e funcionalidades do seu backend, além de detalhes de configuração e dependências necessárias para rodar o projeto.
