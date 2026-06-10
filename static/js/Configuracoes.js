// Abre o modal
function abrirConfiguracoes() {
    const overlay = document.getElementById('overlayConfiguracoes');
    const modal = document.getElementById('modalConfiguracoes');
    const nomeCompleto = localStorage.getItem('nomeUsuario') || '';

    // Preenche o perfil
    document.getElementById('avatarModal').textContent = nomeCompleto.charAt(0).toUpperCase();
    document.getElementById('nomePerfilModal').textContent = nomeCompleto;

    // Aplica estado salvo dos toggles
    document.getElementById('togglePromocoes').checked = localStorage.getItem('notifPromocoes') !== 'false';
    document.getElementById('togglePedido').checked = localStorage.getItem('notifPedido') !== 'false';
    document.getElementById('togglePedidoRapido').checked = localStorage.getItem('pedidoRapido') === 'true';
    document.getElementById('toggleEndereco').checked = localStorage.getItem('salvarEndereco') !== 'false';

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
    const overlay = document.getElementById('overlayConfiguracoes');
    const modal = document.getElementById('modalConfiguracoes');

    overlay.classList.remove('visivel');
    modal.classList.remove('visivel');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {

    // Fechar pelo botão X e overlay
    document.getElementById('fecharModalConfiguracoes').addEventListener('click', fecharConfiguracoes);
    document.getElementById('overlayConfiguracoes').addEventListener('click', fecharConfiguracoes);

    // Tema
    document.querySelectorAll('.btnTema').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btnTema').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            localStorage.setItem('tema', btn.dataset.tema);
        });
    });

    // Toggles
    document.getElementById('togglePromocoes').addEventListener('change', e => {
        localStorage.setItem('notifPromocoes', e.target.checked);
    });

    document.getElementById('togglePedido').addEventListener('change', e => {
        localStorage.setItem('notifPedido', e.target.checked);
    });

    document.getElementById('togglePedidoRapido').addEventListener('change', e => {
        localStorage.setItem('pedidoRapido', e.target.checked);
    });

    document.getElementById('toggleEndereco').addEventListener('change', e => {
        localStorage.setItem('salvarEndereco', e.target.checked);
    });
});