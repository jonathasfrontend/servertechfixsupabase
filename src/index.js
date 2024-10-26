const express = require('express')
const moment = require('moment');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { corsConfig } = require('./config/cors.config')

function generateToken(params = {}){
    return jwt.sign(params, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
}

const createSupabaseClient = require('./connectionBD/connectiondb');
const supabase = createSupabaseClient();

const app = express();
app.use(express.json());
app.use(cors(corsConfig));

app.get('/produto/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data: ordens, error: ordemError } = await supabase
        .from('ordem')
        .select('*')
        .eq('fk_cliente_id', id);

    if (ordemError) return res.status(500).json({ error: ordemError.message });
    if (!ordens || ordens.length === 0) return res.status(404).json({ error: "Nenhuma ordem encontrada" });

    const { data: cliente, error: clienteError } = await supabase
        .from('cliente')
        .select('*')
        .eq('id', id)
        .single();

    if (clienteError) return res.status(500).json({ error: clienteError.message });

    res.status(200).json({ cliente, ordens });
});

app.get('/cliente/:clienteId/ordem/:ordemId', async (req, res) => {
    const { clienteId, ordemId } = req.params;

    try {
        // Verificar se o cliente existe usando o ID
        const { data: cliente, error: clienteError } = await supabase
            .from('cliente')
            .select('*')
            .eq('id', clienteId)
            .single();

        if (clienteError) return res.status(500).json({ error: clienteError.message });
        if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });

        // Buscar a ordem específica para o cliente pelo ID
        const { data: ordem, error: ordemError } = await supabase
            .from('ordem')
            .select('*')
            .eq('id', ordemId)
            .eq('fk_cliente_id', clienteId)  // Relaciona a ordem com o ID do cliente
            .single();

        if (ordemError) return res.status(500).json({ error: ordemError.message });
        if (!ordem) return res.status(404).json({ error: "Ordem não encontrada para este cliente" });

        res.status(200).json({ cliente, ordem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/ultimas-ordens', async (req, res) => {
    try {
        const { data: ordens, error: ordemError } = await supabase
            .from('ordem')
            .select('*, cliente(*)')
            .order('data', { ascending: false });

        if (ordemError) return res.status(500).json({ error: ordemError.message });
        
        const ultimasOrdens = [];
        const seen = new Set();

        for (const ordem of ordens) {
            if (!seen.has(ordem.fk_cliente_cpf)) {
                ultimasOrdens.push(ordem);
                seen.add(ordem.fk_cliente_cpf);
            }
        }

        res.status(200).json(ultimasOrdens);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/categoria', async (req, res) => {
    try {
        const { data: categorias, error } = await supabase
            .from('categoria')
            .select('*');

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/status', async (req, res) => {
    try {
        const { data: statusList, error } = await supabase
            .from('status')
            .select('*');

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json(statusList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/admins', async (req, res) => {
    try {
        const { data: admins, error: adminsError } = await supabase
            .from('admin')
            .select('*');

        if (adminsError) {
            return res.status(500).json({ error: adminsError.message });
        }

        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/pesquisa/:search', async (req, res) => {
    const { search } = req.params;

    try {
        const { data: clientes, error: clienteError } = await supabase
            .from('cliente')
            .select('*, ordem(*)')
            .or(`cpf.eq.${search},nome.ilike.%${search}%,telefone.ilike.%${search}%`);

        if (clienteError) return res.status(500).json({ error: clienteError.message });
        if (!clientes || clientes.length === 0) return res.status(404).json({ error: "Nenhum cliente encontrado" });

        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/cliente-e-ordem', async (req, res) => {
    const { nome, telefone, endereco, cpf, info_produto, defeito, solucao, garantia, fk_categoria_id, fk_status_id, orcamento } = req.body;
    const data = moment().format('YYYY-MM-DD');

    const clienteId = uuidv4(); // Gera um UUID para o cliente
    const ordemId = uuidv4();   // Gera um UUID para a ordem

    // Insere o novo cliente com o ID gerado
    const { data: cliente, error: clienteError } = await supabase
        .from('cliente')
        .insert([{ id: clienteId, cpf: String(cpf), nome, telefone, endereco }])
        .select()
        .single();

    if (clienteError) return res.status(500).json({ error: clienteError.message });

    // Insere a nova ordem associada ao ID do cliente recém-criado
    const { data: ordem, error: ordemError } = await supabase
        .from('ordem')
        .insert([{
            id: ordemId,
            info_produto,
            defeito,
            solucao,
            garantia,
            data,
            fk_cliente_id: cliente.id,  // Relaciona o ID do cliente na tabela ordem
            fk_categoria_id,
            fk_status_id,
            orcamento
        }]);

    if (ordemError) return res.status(500).json({ error: ordemError.message });

    res.status(201).json({ cliente, ordem });
});

app.post('/cliente/:id/ordem', async (req, res) => {
    const { id } = req.params;
    const { info_produto, defeito, solucao, garantia, fk_categoria_id, fk_status_id, orcamento } = req.body;
    const data = moment().format('YYYY-MM-DD');

    const uuid = uuidv4();
    const ordemId = String(uuid);

    // Buscar cliente pelo ID
    const { data: cliente, error: clienteError } = await supabase
        .from('cliente')
        .select('id')
        .eq('id', id)
        .single();

    if (clienteError) return res.status(500).json({ error: clienteError.message });
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });

    // Inserir nova ordem de serviço associada ao ID do cliente
    const { data: ordem, error: ordemError } = await supabase
        .from('ordem')
        .insert([{
            id: ordemId,
            info_produto,
            defeito,
            solucao,
            garantia,
            data,
            fk_cliente_id: cliente.id,  // Alterado para o ID do cliente
            fk_categoria_id,
            fk_status_id,
            orcamento
        }]);

    if (ordemError) return res.status(500).json({ error: ordemError.message });

    res.status(201).json(ordem);
});


app.put('/cliente/:cpf/ordem/:id', async (req, res) => {
    const { cpf, id } = req.params;
    const { nome, telefone, endereco, info_produto, defeito, solucao, fk_status_id, orcamento } = req.body;

    try {
        // Verificar se o cliente existe
        const { data: cliente, error: clienteError } = await supabase
            .from('cliente')
            .select('*')
            .eq('cpf', cpf)
            .single();

        if (clienteError) return res.status(500).json({ error: clienteError.message });
        if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });

        // Atualizar os dados do cliente
        const { data: updatedCliente, error: updateClienteError } = await supabase
            .from('cliente')
            .update({ nome, telefone, endereco })
            .eq('cpf', cpf)
            .single();

        if (updateClienteError) return res.status(500).json({ error: updateClienteError.message });

        // Verificar se a ordem existe
        const { data: ordem, error: ordemError } = await supabase
            .from('ordem')
            .select('*')
            .eq('id', id)
            .eq('fk_cliente_cpf', cpf)
            .single();

        if (ordemError) return res.status(500).json({ error: ordemError.message });
        if (!ordem) return res.status(404).json({ error: "Ordem não encontrada para este cliente" });

        // Atualizar os dados da ordem
        const { data: updatedOrdem, error: updateOrdemError } = await supabase
            .from('ordem')
            .update({ info_produto, defeito, solucao, fk_status_id, orcamento })
            .eq('id', id)
            .eq('fk_cliente_cpf', cpf)
            .single();

        if (updateOrdemError) return res.status(500).json({ error: updateOrdemError.message });

        res.status(200).json({ updatedCliente, updatedOrdem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/register-admin', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verificar se o email já existe
        const { data: existingAdmin, error: checkError } = await supabase
            .from('admin')
            .select('*')
            .eq('email', email)
            .single();

        if (existingAdmin) {
            return res.status(400).json({ error: 'O email já está em uso' });
        }

        if (checkError && checkError.code !== 'PGRST116') {
            return res.status(500).json({ error: checkError.message });
        }

        // Criptografar a senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        const uuid = uuidv4();

        // Inserir o novo administrador no banco de dados
        const { data: newAdmin, error: insertError } = await supabase
            .from('admin')
            .insert([{ id: uuid, nome, email, senha: hashedSenha }])
            .select()
            .single();

        if (insertError) {
            return res.status(500).json({ error: insertError.message });
        }

        res.status(201).json({
            message: 'Administrador cadastrado com sucesso!',
            admin: newAdmin,
            token: generateToken({id: newAdmin.id, email: newAdmin.email})
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/authenticate', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data: admin, error: adminError } = await supabase
            .from('admin')
            .select('*')
            .eq('email', email)
            .single();

        if (adminError) {
            return res.status(500).json({ error: adminError.message });
        }
        if (!admin.email) {
            return res.status(400).json({ error: 'Email incorreto' });
        }

        const isPasswordValid = await bcrypt.compare(senha, admin.senha);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Senha incorreta' });
        }

        res.status(200).json({
            nome: admin.nome,
            email: admin.email,
            message: 'Autenticação bem-sucedida',
            token: generateToken({id: admin.id, email: admin.email})
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
