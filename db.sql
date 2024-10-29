CREATE TABLE Ordem (
    id VARCHAR PRIMARY KEY UNIQUE,
    data DATE,
    info_produto VARCHAR,
    defeito VARCHAR,
    solucao VARCHAR,
    garantia VARCHAR,
    fk_Cliente_id VARCHAR,
    fk_Status_id INTEGER,
    fk_Categoria_id INTEGER
);

CREATE TABLE Status (
    id INTEGER PRIMARY KEY UNIQUE,
    status VARCHAR
);

CREATE TABLE Categoria (
    id INTEGER PRIMARY KEY UNIQUE,
    categoria VARCHAR
);

CREATE TABLE Cliente (
    id VARCHAR PRIMARY KEY UNIQUE,
    cpf VARCHAR,
    nome VARCHAR,
    endereco VARCHAR,
    telefone VARCHAR
);

CREATE TABLE admin (
    id VARCHAR PRIMARY KEY UNIQUE,
    nome VARCHAR,
    email VARCHAR,
    senha VARCHAR
);
 
ALTER TABLE Ordem ADD CONSTRAINT FK_Ordem_5
    FOREIGN KEY (fk_Cliente_id)
    REFERENCES Cliente (id)
    ON DELETE RESTRICT;
 
ALTER TABLE Ordem ADD CONSTRAINT FK_Ordem_3
    FOREIGN KEY (fk_Status_id)
    REFERENCES Status (id)
    ON DELETE RESTRICT;
 
ALTER TABLE Ordem ADD CONSTRAINT FK_Ordem_4
    FOREIGN KEY (fk_Categoria_id)
    REFERENCES Categoria (id)
    ON DELETE RESTRICT;


INSERT INTO "public"."categoria" ("id", "categoria") VALUES ('1', 'TVs'), ('2', 'Notebook'), ('3', 'PC de Mesa'), ('4', 'Impressora'), ('5', 'Celular');
INSERT INTO "public"."status" ("id", "status") VALUES ('1', 'Recebido'), ('2', 'Em avaliação'), ('3', 'Orçamento aprovado'), ('4', 'Orçamento Reprovado'), ('5', 'Em reparo'), ('6', 'Aguardando Peças'), ('7', 'Reparo Concluído'), ('8', 'Reparo Mal Sucedido'), ('9', 'Pronto para Retirada/Entrega'), ('10', 'Entregue'), ('11', 'Devolução Solicitada'), ('12', 'Produto Devolvido'), ('13', 'Concluido'), ('14', 'Cancelada');