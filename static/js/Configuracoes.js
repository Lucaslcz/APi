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
    document.getElementById('togglePedidoRapido').checked = localStorage.getItem('pedidoRapido') === 'true';
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

    document.getElementById('togglePedidoRapido')?.addEventListener('change', e => {
        localStorage.setItem('pedidoRapido', e.target.checked);
    });
    
    document.getElementById('toggleEndereco')?.addEventListener('change', e => {
        localStorage.setItem('salvarEndereco', e.target.checked);
    });
});