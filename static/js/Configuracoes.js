// Aplica o tema salvo ao carregar a página
(function () {
    const tema = localStorage.getItem('tema') || 'escuro';
    aplicarTema(tema);
})();

// Aplica o tema no body
function aplicarTema(tema) {
    if (tema === 'claro') {
        document.body.classList.add('tema-claro');
    } else {
        document.body.classList.remove('tema-claro');
    }
}

// Abre o modal
function abrirConfiguracoes() {
    const overlay      = document.getElementById('overlayConfiguracoes');
    const modal        = document.getElementById('modalConfiguracoes');
    const nomeCompleto = localStorage.getItem('nomeUsuario') || '';
    const cargo        = localStorage.getItem('cargo') || 'cliente';

    // Preenche o perfil
    document.getElementById('avatarModal').textContent = nomeCompleto.charAt(0).toUpperCase();
    document.getElementById('nomePerfilModal').textContent = nomeCompleto;

    // Exibe o cargo com badge colorida
    const tagPerfil = document.getElementById('tagPerfilModal');
    const cargosConfig = {
        chefe:       { label: 'Chefe',            emoji: '👑', classe: 'tagChefe' },
        funcionario: { label: 'Funcionário',       emoji: '🧑‍🍳', classe: 'tagFuncionario' },
        cliente:     { label: 'Membro Calabreso',  emoji: '🍔', classe: 'tagCliente' },
    };
    const cfg = cargosConfig[cargo] || cargosConfig.cliente;
    tagPerfil.textContent = `${cfg.emoji} ${cfg.label}`;
    tagPerfil.className   = 'tagCargo ' + cfg.classe;

    // Aplica estado salvo dos toggles
    document.getElementById('togglePromocoes').checked    = localStorage.getItem('notifPromocoes') !== 'false';
    document.getElementById('togglePedido').checked       = localStorage.getItem('notifPedido') !== 'false';
    document.getElementById('toggleEndereco').checked     = localStorage.getItem('salvarEndereco') !== 'false';

    // Aplica tema ativo
    const temaSalvo = localStorage.getItem('tema') || 'escuro';
    document.querySelectorAll('.btnTema').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.tema === temaSalvo);
    });

    overlay.classList.add('visivel');
    modal.classList.add('visivel');
    document.body.style.overflow = 'hidden';
}

// Fecha o modal
function fecharConfiguracoes() {
    document.getElementById('overlayConfiguracoes').classList.remove('visivel');
    document.getElementById('modalConfiguracoes').classList.remove('visivel');
    document.body.style.overflow = '';
}

// Repete o último pedido do histórico, adicionando os itens de volta ao carrinho
async function repetirUltimoPedido() {
    const idUsuario = localStorage.getItem('idUsuario');

    if (!idUsuario) {
        fecharConfiguracoes();
        criarPopupLogin();
        return;
    }

    const item = document.getElementById('btnRepetirPedido');

    try {
        if (item) item.style.opacity = '0.6';

        const respHistorico = await fetch(`/api/historico/${idUsuario}`);
        if (!respHistorico.ok) throw new Error();
        const pedidos = await respHistorico.json();

        if (!pedidos || pedidos.length === 0) {
            mostrarToastConfig('Você ainda não fez nenhum pedido. 🍔');
            return;
        }

        const ultimoPedido = pedidos[0]; // já vem ordenado DESC por criado_em

        // Quebra a descrição em itens: "2x Classic Burger, 1x Coca-Cola Lata"
        const partes = ultimoPedido.descricao.split(',').map(p => p.trim());

        const itensDesejados = partes.map(parte => {
            const match = parte.match(/^(\d+)x\s+(.+)$/i);
            if (!match) return null;
            return { quantidade: parseInt(match[1], 10), nome: match[2].trim() };
        }).filter(Boolean);

        if (itensDesejados.length === 0) {
            mostrarToastConfig('Não conseguimos reconhecer os itens desse pedido.');
            return;
        }

        // Busca o cardápio atual pra reconstruir os itens com preço e tempo de preparo certos
        const respCardapio = await fetch('/api/cardapio');
        if (!respCardapio.ok) throw new Error();
        const cardapio = await respCardapio.json();

        const itensMontados      = [];
        const itensIndisponiveis = [];

        itensDesejados.forEach(desejado => {
            const itemCardapio = cardapio.find(c =>
                c.nome.trim().toLowerCase() === desejado.nome.toLowerCase()
            );

            if (!itemCardapio || itemCardapio.disponivel === 'Nao') {
                itensIndisponiveis.push(desejado.nome);
                return;
            }

            itensMontados.push({
                id:            itemCardapio.id,
                nome:          itemCardapio.nome,
                preco:         itemCardapio.preco,
                quantidade:    desejado.quantidade,
                tempo_preparo: itemCardapio.tempo_preparo,
                categoria:     itemCardapio.categoria
            });
        });

        if (itensMontados.length === 0) {
            mostrarToastConfig('Os itens desse pedido não estão mais disponíveis. 😕');
            return;
        }

        // Salva no carrinho (substitui o carrinho atual)
        localStorage.setItem('carrinhoCalabreso', JSON.stringify(itensMontados));

        if (itensIndisponiveis.length > 0) {
            mostrarToastConfig(`Pedido repetido! Indisponíveis: ${itensIndisponiveis.join(', ')}`);
            setTimeout(() => { window.location.href = '/finalizar'; }, 2200);
        } else {
            window.location.href = '/finalizar';
        }

    } catch {
        mostrarToastConfig('Não foi possível repetir o pedido. Tente novamente.');
    } finally {
        if (item) item.style.opacity = '1';
    }
}

// Toast simples pra avisos do modal de configurações
function mostrarToastConfig(msg) {
    const existente = document.getElementById('toastConfiguracoes');
    if (existente) existente.remove();

    const toast = document.createElement('div');
    toast.id = 'toastConfiguracoes';
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('visivel'));
    });

    setTimeout(() => {
        toast.classList.remove('visivel');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('fecharModalConfiguracoes')?.addEventListener('click', fecharConfiguracoes);
    document.getElementById('overlayConfiguracoes')?.addEventListener('click', fecharConfiguracoes);

    // Troca de tema com aplicação imediata
    document.querySelectorAll('.btnTema').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btnTema').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            const tema = btn.dataset.tema;
            localStorage.setItem('tema', tema);
            aplicarTema(tema);
        });
    });

    // Toggles
    document.getElementById('togglePromocoes')?.addEventListener('change', e => {
        localStorage.setItem('notifPromocoes', e.target.checked);
    });

    document.getElementById('togglePedido')?.addEventListener('change', e => {
        localStorage.setItem('notifPedido', e.target.checked);
        
        // Aplica imediatamente sem precisar recarregar
        const badge = document.getElementById('badgePedidoAtivo');
        if (badge) {
            badge.style.display = e.target.checked ? '' : 'none';
        }
    });

    document.getElementById('toggleEndereco')?.addEventListener('change', e => {
        localStorage.setItem('salvarEndereco', e.target.checked);
    });

    document.getElementById('btnRepetirPedido')?.addEventListener('click', repetirUltimoPedido);

    document.getElementById('btnHistoricoPedidos')?.addEventListener('click', () => {
        window.location.href = '/historico';
    });
});