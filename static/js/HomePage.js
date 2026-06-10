// Captura o nome que vem do login e salva no localStorange
const paramsHome = new URLSearchParams(window.location.search);
if (paramsHome.get('logado') === 'true' && paramsHome.get('nome')) {
    localStorage.setItem('nomeUsuario', paramsHome.get('nome'));
    localStorage.setItem('idUsuario', paramsHome.get('id'));
    localStorage.setItem('cargo' , paramsHome.get('cargo'));
    window.location.href = "/";
}





// Efeito da section de promoções que faz os cartões acompanharem o mouse
document.addEventListener("DOMContentLoaded", () => {
    const cardsPromocao = document.querySelectorAll('.card-promocao');

    cardsPromocao.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const dimensões = card.getBoundingClientRect();
            const posX = e.clientX - dimensões.left; 
            const posY = e.clientY - dimensões.top;
            
            const centroX = dimensões.width / 2;
            const centroY = dimensões.height / 2;
            
            const rotX = -(posY - centroY) / centroY * 18;
            const rotY = (posX - centroX) / centroX * 18;
            
            card.style.setProperty('--rx', `${rotX}deg`);
            card.style.setProperty('--ry', `${rotY}deg`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
});





// Animação da luz que acompanha o mouse
const rodape = document.getElementById("rodapePrincipal");
const luz = document.querySelector(".efeito-luz");

rodape.addEventListener("mousemove", (evento) => {

    const posicaoX = evento.clientX - rodape.offsetLeft;

    luz.style.left = `${posicaoX}px`;

});





// Verifica se tem usuário logado e substitui o botão Login pelo nome
const nomeUsuario = localStorage.getItem('nomeUsuario');
const botaoLogin = document.getElementById('botaoLogin');

if (nomeUsuario && botaoLogin) {
    const primeiroNome = nomeUsuario.split(' ')[0];

    const wrapperUsuario = document.createElement('div');
    wrapperUsuario.id = 'wrapperUsuario';

    const botaoUsuario = document.createElement('button');
    botaoUsuario.id = 'botaoUsuario';
    botaoUsuario.textContent = primeiroNome;

    const dropdown = document.createElement('div');
    dropdown.id = 'dropdownUsuario';
    dropdown.innerHTML = `
        <button id="btnConfiguracoes">⚙️ Configurações</button>
        <div id="separadorDropdown"></div>
        <button id="btnSair">Sair</button>
    `;

    wrapperUsuario.appendChild(botaoUsuario);
    wrapperUsuario.appendChild(dropdown);
    botaoLogin.replaceWith(wrapperUsuario);

    // Abre/fecha o dropdown ao clicar no botão do usuário
    botaoUsuario.addEventListener('click', () => {
        dropdown.classList.toggle('aberto');
    });

    // Fecha o dropdown se clicar fora
    document.addEventListener('click', (e) => {
        if (!wrapperUsuario.contains(e.target)) {
            dropdown.classList.remove('aberto');
        }
    });

    // Botão Sair — limpa o localStorage e recarrega
    document.getElementById('btnSair').addEventListener('click', () => {
        localStorage.removeItem('nomeUsuario');
        localStorage.removeItem('idUsuario');
        window.location.reload();
    });

    document.getElementById('btnConfiguracoes').addEventListener('click', () => {
        dropdown.classList.remove('aberto');
        abrirConfiguracoes();
    });
}