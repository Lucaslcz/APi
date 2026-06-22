// Formata número como moeda brasileira
function formatarDinheiro(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Exibe toast de feedback no canto inferior direito
function exibirToast(mensagem) {
    const toast = document.getElementById('toastEmpresa');
    const texto = document.getElementById('toastTexto');
    if (!toast || !texto) return;
    texto.textContent = mensagem;
    toast.classList.add('visivel');
    setTimeout(() => toast.classList.remove('visivel'), 2800);
}

// Bloqueia a página se o cargo não for chefe ou funcionário
function verificarAcesso() {
    const cargo = localStorage.getItem('cargo');
    if (cargo !== 'chefe' && cargo !== 'funcionario') {
        document.body.innerHTML = `
            <div id="bloqueioAcesso">
                <div id="bloqueioIcone"><i class="fa-solid fa-lock"></i></div>
                <h2>Acesso restrito</h2>
                <p>Essa área é exclusiva para a equipe da hamburgueria.</p>
                <button onclick="window.location.href='/menu'">Voltar ao Menu</button>
            </div>
        `;
        return false;
    }
    return true;
}

// Funcionário só visualiza: esconde todos os botões de ação da página
function aplicarPermissoesEmpresa() {
    const cargo = localStorage.getItem('cargo');
    if (cargo === 'chefe') return; // chefe mantém acesso total

    document.getElementById('btnEditarDados')?.remove();
    document.getElementById('btnNovoAviso')?.remove();
}

// Exibe a data atual no topo
function exibirData() {
    const el = document.getElementById('dataHoje');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
}

// Busca pedidos e clientes e preenche os cards de métricas
async function carregarMetricas() {
    try {
        const [resCaixa, resClientes] = await Promise.all([
            fetch('/api/caixa'),
            fetch('/api/clientes')
        ]);
        const pedidos  = await resCaixa.json();
        const clientes = await resClientes.json();

        const hoje = new Date().toISOString().slice(0, 10);
        const mes  = new Date().toISOString().slice(0, 7);

        const pedidosHoje = pedidos.filter(p => p.criado_em?.startsWith(hoje));
        const pedidosMes  = pedidos.filter(p => p.criado_em?.startsWith(mes));

        const fatHoje = pedidosHoje.reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
        const fatMes  = pedidosMes.reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
        const ticket  = pedidosMes.length > 0 ? fatMes / pedidosMes.length : 0;

        document.getElementById('statPedidosHoje').textContent     = pedidosHoje.length;
        document.getElementById('statFaturamentoHoje').textContent  = formatarDinheiro(fatHoje);
        document.getElementById('statPedidosMes').textContent       = pedidosMes.length;
        document.getElementById('statFaturamentoMes').textContent   = formatarDinheiro(fatMes);
        document.getElementById('statClientes').textContent         = clientes.length;
        document.getElementById('statTicket').textContent           = formatarDinheiro(ticket);

        carregarPopulares(pedidosMes);
    } catch (err) {
        console.error('Erro ao carregar métricas:', err);
    }
}

// Analisa as descrições dos pedidos e monta o ranking de itens mais pedidos
function carregarPopulares(pedidosMes) {
    const contagem = {};

    pedidosMes.forEach(pedido => {
        if (!pedido.descricao) return;
        pedido.descricao.split(',').forEach(parte => {
            const match = parte.trim().match(/^(\d+)x\s+(.+)$/);
            if (!match) return;
            const qtd  = parseInt(match[1]);
            const nome = match[2].trim();
            contagem[nome] = (contagem[nome] || 0) + qtd;
        });
    });

    const lista  = document.getElementById('listaPopulares');
    const vazio  = document.getElementById('popularesVazio');
    const itens  = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 7);

    if (itens.length === 0) {
        if (vazio) vazio.textContent = 'Nenhum pedido registrado este mês.';
        return;
    }

    if (vazio) vazio.remove();

    const maximo = itens[0][1];
    itens.forEach(([nome, qtd], i) => {
        const pct = Math.round((qtd / maximo) * 100);
        const div = document.createElement('div');
        div.className = 'itemPopular';
        div.innerHTML = `
            <span class="popularPosicao ${i < 3 ? 'top' : ''}">${i + 1}</span>
            <div class="popularInfo">
                <div class="popularTopo">
                    <span class="popularNome">${nome}</span>
                    <span class="popularQtd">${qtd} pedido${qtd !== 1 ? 's' : ''}</span>
                </div>
                <div class="popularBarra"><div class="popularBarraInner" style="width:${pct}%"></div></div>
            </div>
        `;
        lista.appendChild(div);
    });
}

// Carrega dados da empresa da API e preenche os campos
async function carregarDadosEmpresa() {
    try {
        const res   = await fetch('/api/empresa');
        const dados = await res.json();
        document.getElementById('inputNome').value            = dados.nome     || '';
        document.getElementById('inputCNPJ').value            = dados.cnpj     || '';
        document.getElementById('inputTelefone').value        = dados.telefone || '';
        document.getElementById('inputEmailEmpresa').value    = dados.email    || '';
        document.getElementById('inputEnderecoEmpresa').value = dados.endereco || '';
        document.getElementById('inputHorario').value         = dados.horario  || '';
    } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
    }
}

// Habilita os campos para edição
function ativarEdicao() {
    ['inputNome','inputCNPJ','inputTelefone','inputEmailEmpresa','inputEnderecoEmpresa','inputHorario']
        .forEach(id => document.getElementById(id).disabled = false);
    document.getElementById('acoesDados').classList.remove('escondido');
    document.getElementById('btnEditarDados').style.display = 'none';
}

// Desativa edição sem salvar e restaura valores originais
function cancelarEdicao() {
    ['inputNome','inputCNPJ','inputTelefone','inputEmailEmpresa','inputEnderecoEmpresa','inputHorario']
        .forEach(id => document.getElementById(id).disabled = true);
    document.getElementById('acoesDados').classList.add('escondido');
    if (document.getElementById('btnEditarDados')) {
        document.getElementById('btnEditarDados').style.display = '';
    }
    carregarDadosEmpresa();
}

// Envia os dados editados para a API
async function salvarDadosEmpresa() {
    const payload = {
        nome:     document.getElementById('inputNome').value,
        cnpj:     document.getElementById('inputCNPJ').value,
        telefone: document.getElementById('inputTelefone').value,
        email:    document.getElementById('inputEmailEmpresa').value,
        endereco: document.getElementById('inputEnderecoEmpresa').value,
        horario:  document.getElementById('inputHorario').value,
    };
    try {
        const res = await fetch('/api/empresa/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            exibirToast('Dados salvos com sucesso!');
            cancelarEdicao();
        } else {
            exibirToast('Erro ao salvar dados.');
        }
    } catch {
        exibirToast('Erro de conexão.');
    }
}

// Busca os avisos da API e renderiza na lista
async function carregarAvisos() {
    try {
        const res    = await fetch('/api/avisos');
        const avisos = await res.json();
        renderizarAvisos(avisos);
    } catch (err) {
        console.error('Erro ao carregar avisos:', err);
    }
}

// Renderiza os avisos na tela
function renderizarAvisos(avisos) {
    const lista     = document.getElementById('listaAvisos');
    const vazio     = document.getElementById('muraiVazio');
    const ehChefe   = localStorage.getItem('cargo') === 'chefe';

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
            <div class="avisoConteudo">
                <p class="avisoTexto">${aviso.texto}</p>
                <span class="avisoData">${new Date(aviso.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            ${ehChefe ? `<button class="btnDeletarAviso" title="Remover"><i class="fa-solid fa-xmark"></i></button>` : ''}
        `;
        if (ehChefe) {
            div.querySelector('.btnDeletarAviso').addEventListener('click', () => deletarAviso(aviso.id, div));
        }
        lista.appendChild(div);
    });
}

// Envia novo aviso para a API
async function publicarAviso() {
    const texto = document.getElementById('inputAviso').value.trim();
    if (!texto) return;

    try {
        const res = await fetch('/api/avisos/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });
        if (res.ok) {
            document.getElementById('inputAviso').value = '';
            document.getElementById('formAviso').classList.add('escondido');
            exibirToast('Aviso publicado!');
            carregarAvisos();
        }
    } catch {
        exibirToast('Erro ao publicar aviso.');
    }
}

// Remove aviso da API e da tela
async function deletarAviso(id, elemento) {
    try {
        const res = await fetch(`/api/avisos/deletar/${id}`, { method: 'DELETE' });
        if (res.ok) {
            elemento.remove();
            exibirToast('Aviso removido.');
            if (!document.querySelector('.itemAviso')) {
                const vazio = document.getElementById('muraiVazio');
                if (vazio) vazio.style.display = '';
            }
        }
    } catch {
        exibirToast('Erro ao remover aviso.');
    }
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    if (!verificarAcesso()) return;

    aplicarPermissoesEmpresa();
    exibirData();
    carregarMetricas();
    carregarDadosEmpresa();
    carregarAvisos();

    document.getElementById('btnEditarDados')?.addEventListener('click', ativarEdicao);
    document.getElementById('btnSalvarDados')?.addEventListener('click', salvarDadosEmpresa);
    document.getElementById('btnCancelarDados')?.addEventListener('click', cancelarEdicao);

    document.getElementById('btnNovoAviso')?.addEventListener('click', () => {
        document.getElementById('formAviso').classList.toggle('escondido');
    });
    document.getElementById('btnPublicarAviso')?.addEventListener('click', publicarAviso);
    document.getElementById('btnCancelarAviso')?.addEventListener('click', () => {
        document.getElementById('inputAviso').value = '';
        document.getElementById('formAviso').classList.add('escondido');
    });
});