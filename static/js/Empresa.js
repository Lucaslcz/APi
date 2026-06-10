// Pega os dados do usuário salvo no localStorage
const idUsuario = parseInt(localStorage.getItem('idUsuario'));
const nomeUsuario = localStorage.getItem('nomeUsuario');
const cargoUsuario = localStorage.getItem('cargoUsuario');

// Bloqueia a página se o usuário não for chefe
function verificarAcesso() {
    if (cargo == 'chefe') {
        document.body.innerHTML = `
            <div id="bloqueioAcesso">
                <div id="bloqueioIcone">🔒</div>
                <h2 id="bloqueioTitulo">Acesso restrito</h2>
                <p id="bloqueioMensagem">Só o chefe pode acessar esta área.</p>
                <button id="bloqueioVoltar" onclick="window.location.href='/'">Voltar ao início</button>
            </div>
        `;
    }
}

// Exibe uma mensagem rápida no canto inferior direito
function exibirToast(mensagem) {
    const toast = document.getElementById('toastEmpresa');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('visivel');
    setTimeout(() => toast.classList.remove('visivel'), 2800);
}

// Formata número como dinheiro brasileiro
function formatarDinheiro(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Exibe a data atual no topo do painel
function exibirDataHoje() {
    const el = document.getElementById('dataHojeTexto');
    if (!el) return;
    const agora = new Date();
    el.textContent = agora.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Carrega os cards de métricas usando os dados da caixa e dos clientes
async function carregarMetricas() {
    try {
        const [resCaixa, resClientes] = await Promise.all([
            fetch('/api/caixa'),
            fetch('/api/clientes')
        ]);

        const pedidos = await resCaixa.json();
        const clientes = await resClientes.json();

        const hoje = new Date().toISOString().slice(0, 10);
        const mesAtual = new Date().toISOString().slice(0, 7);

        // Filtra pedidos de hoje
        const pedidosHoje = pedidos.filter(p => p.criado_em?.startsWith(hoje));
        // Filtra pedidos do mês atual
        const pedidosMes = pedidos.filter(p => p.criado_em?.startsWith(mesAtual));

        const faturamentoHoje = pedidosHoje.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
        const faturamentoMes  = pedidosMes.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
        const ticketMedio     = pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0;

        document.getElementById('totalPedidosHoje').textContent   = pedidosHoje.length;
        document.getElementById('totalFaturamentoHoje').textContent = formatarDinheiro(faturamentoHoje);
        document.getElementById('totalPedidosMes').textContent    = pedidosMes.length;
        document.getElementById('totalFaturamentoMes').textContent = formatarDinheiro(faturamentoMes);
        document.getElementById('totalClientes').textContent      = clientes.length;
        document.getElementById('ticketMedio').textContent        = formatarDinheiro(ticketMedio);

        // Reaplica os dados de itens populares depois de ter os pedidos carregados
        carregarItensPopulares(pedidosMes);

    } catch (err) {
        console.error('Erro ao carregar métricas:', err);
    }
}

// Analisa as descrições dos pedidos e conta quais itens aparecem mais
function carregarItensPopulares(pedidosMes) {
    const contagem = {};

    pedidosMes.forEach(pedido => {
        if (!pedido.descricao) return;
        // A descrição vem como "2x Hamburguer Calabreso, 1x Batata Frita"
        const partes = pedido.descricao.split(',');
        partes.forEach(parte => {
            const match = parte.trim().match(/^(\d+)x\s+(.+)$/);
            if (!match) return;
            const qtd  = parseInt(match[1]);
            const nome = match[2].trim();
            contagem[nome] = (contagem[nome] || 0) + qtd;
        });
    });

    const lista = document.getElementById('listaItensPopulares');
    const mensagem = document.getElementById('itensMensagem');

    const itensOrdenados = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 7);

    if (itensOrdenados.length === 0) {
        if (mensagem) mensagem.textContent = 'Nenhum pedido registrado este mês.';
        return;
    }

    if (mensagem) mensagem.remove();

    const maximo = itensOrdenados[0][1];

    itensOrdenados.forEach(([nome, qtd], index) => {
        const porcentagem = Math.round((qtd / maximo) * 100);
        const div = document.createElement('div');
        div.className = 'itemPopular';
        div.innerHTML = `
            <span class="itemPopularPosicao ${index < 3 ? 'top' : ''}">${index + 1}</span>
            <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="itemPopularNome">${nome}</span>
                    <span class="itemPopularQtd">${qtd} pedido${qtd !== 1 ? 's' : ''}</span>
                </div>
                <div class="itemPopularBarra" style="width:${porcentagem}%"></div>
            </div>
        `;
        lista.appendChild(div);
    });
}

// Carrega os dados da empresa do banco e preenche os inputs
async function carregarDadosEmpresa() {
    try {
        const res = await fetch('/api/empresa');
        const dados = await res.json();

        document.getElementById('empresaNome').value     = dados.nome      || '';
        document.getElementById('empresaCNPJ').value     = dados.cnpj      || '';
        document.getElementById('empresaTelefone').value = dados.telefone  || '';
        document.getElementById('empresaEndereco').value = dados.endereco  || '';
        document.getElementById('empresaHorario').value  = dados.horario   || '';
    } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
    }
}

// Ativa o modo de edição nos campos da empresa
function ativarEdicaoEmpresa() {
    ['empresaNome', 'empresaCNPJ', 'empresaTelefone', 'empresaEndereco', 'empresaHorario'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
    document.getElementById('botoesFormEmpresa').classList.remove('escondido');
    document.getElementById('botaoEditarEmpresa').style.display = 'none';
}

// Desativa o modo de edição sem salvar
function cancelarEdicaoEmpresa() {
    ['empresaNome', 'empresaCNPJ', 'empresaTelefone', 'empresaEndereco', 'empresaHorario'].forEach(id => {
        document.getElementById(id).disabled = true;
    });
    document.getElementById('botoesFormEmpresa').classList.add('escondido');
    document.getElementById('botaoEditarEmpresa').style.display = '';
    carregarDadosEmpresa();
}

// Envia os dados editados da empresa para o servidor
async function salvarDadosEmpresa(e) {
    e.preventDefault();
    const payload = {
        nome:     document.getElementById('empresaNome').value,
        cnpj:     document.getElementById('empresaCNPJ').value,
        telefone: document.getElementById('empresaTelefone').value,
        endereco: document.getElementById('empresaEndereco').value,
        horario:  document.getElementById('empresaHorario').value,
    };
    try {
        const res = await fetch('/api/empresa/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            exibirToast('✅ Dados salvos com sucesso!');
            cancelarEdicaoEmpresa();
        } else {
            exibirToast('❌ Erro ao salvar dados.');
        }
    } catch {
        exibirToast('❌ Erro de conexão.');
    }
}

// Carrega os avisos do mural do banco e renderiza na lista
async function carregarAvisos() {
    try {
        const res = await fetch('/api/avisos');
        const avisos = await res.json();
        renderizarAvisos(avisos);
    } catch (err) {
        console.error('Erro ao carregar avisos:', err);
    }
}

// Renderiza a lista de avisos na tela
function renderizarAvisos(avisos) {
    const lista  = document.getElementById('listaAvisos');
    const vazio  = document.getElementById('muraiVazio');

    // Remove todos os itens antigos, mantém só o parágrafo de vazio
    lista.querySelectorAll('.itemAviso').forEach(el => el.remove());

    if (avisos.length === 0) {
        if (vazio) vazio.style.display = '';
        return;
    }

    if (vazio) vazio.style.display = 'none';

    avisos.forEach(aviso => {
        const div = document.createElement('div');
        div.className = 'itemAviso';
        div.dataset.id = aviso.id;
        div.innerHTML = `
            <div style="flex:1">
                <p class="itemAvisoTexto">${aviso.texto}</p>
                <span class="itemAvisoData">${new Date(aviso.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <button class="botaoDeletarAviso" title="Remover aviso">✕</button>
        `;
        // Ao clicar no X, deleta o aviso
        div.querySelector('.botaoDeletarAviso').addEventListener('click', () => deletarAviso(aviso.id, div));
        lista.appendChild(div);
    });
}

// Envia um novo aviso para o banco
async function publicarAviso() {
    const texto = document.getElementById('textoNovoAviso').value.trim();
    if (!texto) return;

    try {
        const res = await fetch('/api/avisos/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });
        if (res.ok) {
            document.getElementById('textoNovoAviso').value = '';
            document.getElementById('formNovoAviso').classList.add('escondido');
            exibirToast('📌 Aviso publicado!');
            carregarAvisos();
        }
    } catch {
        exibirToast('❌ Erro ao publicar aviso.');
    }
}

// Remove um aviso do banco e da tela
async function deletarAviso(id, elemento) {
    try {
        const res = await fetch(`/api/avisos/deletar/${id}`, { method: 'DELETE' });
        if (res.ok) {
            elemento.remove();
            exibirToast('🗑️ Aviso removido.');
            // Verifica se a lista ficou vazia depois de remover
            const restantes = document.querySelectorAll('.itemAviso');
            if (restantes.length === 0) {
                const vazio = document.getElementById('muraiVazio');
                if (vazio) vazio.style.display = '';
            }
        }
    } catch {
        exibirToast('❌ Erro ao remover aviso.');
    }
}

// Atualiza o botão de usuário no header
function atualizarBotaoUsuario() {
    const botao = document.getElementById('botaoUsuario');
    if (!botao) return;
    if (nomeUsuario) {
        botao.style.display = 'flex';
        botao.textContent = nomeUsuario;
    }
}

// Inicializa tudo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    verificarAcesso();
    exibirDataHoje();
    atualizarBotaoUsuario();
    carregarMetricas();
    carregarDadosEmpresa();
    carregarAvisos();

    // Botão de editar dados da empresa
    document.getElementById('botaoEditarEmpresa')?.addEventListener('click', ativarEdicaoEmpresa);

    // Formulário de dados da empresa
    document.getElementById('formEmpresa')?.addEventListener('submit', salvarDadosEmpresa);

    // Cancela edição da empresa
    document.getElementById('botaoCancelarEmpresa')?.addEventListener('click', cancelarEdicaoEmpresa);

    // Abre o formulário de novo aviso
    document.getElementById('botaoNovoAviso')?.addEventListener('click', () => {
        document.getElementById('formNovoAviso').classList.toggle('escondido');
    });

    // Publica o aviso
    document.getElementById('botaoPublicarAviso')?.addEventListener('click', publicarAviso);

    // Cancela o novo aviso
    document.getElementById('botaoCancelarAviso')?.addEventListener('click', () => {
        document.getElementById('textoNovoAviso').value = '';
        document.getElementById('formNovoAviso').classList.add('escondido');
    });

    // Dropdown do usuário
    const botaoUsuario     = document.getElementById('botaoUsuario');
    const dropdownUsuario  = document.getElementById('dropdownUsuario');
    const btnConfiguracoes = document.getElementById('btnConfiguracoes');
    const btnSair          = document.getElementById('btnSair');

    botaoUsuario?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownUsuario?.classList.toggle('aberto');
    });

    document.addEventListener('click', () => dropdownUsuario?.classList.remove('aberto'));

    btnConfiguracoes?.addEventListener('click', () => window.location.href = '/configuracoes');

    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
});