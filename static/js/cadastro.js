// Efeito de particulas aleatorias no background
const efeitoParticulas = document.getElementById("efeitoParticulas");

for(let indice = 0; indice < 40; indice++){
    const particula = document.createElement("div");

    particula.classList.add("particulaHamburgueria");

    let tamanho = Math.random() * 8 + 4;

    particula.style.width = tamanho + "px";
    particula.style.height = tamanho + "px";
    particula.style.left = Math.random() * window.innerWidth + "px";
    particula.style.top = Math.random() * window.innerHeight + "px";

    particula.style.background =
    Math.random() > 0.5
    ? "#FFD54F"
    : "#4CAF50";

    particula.style.opacity = "0.4";
    efeitoParticulas.appendChild(particula);
    animarParticula(particula);
}

function animarParticula(particula){
    let posicaoY = parseFloat(particula.style.top);
    setInterval(() => {
        posicaoY -= 1;
        if(posicaoY < -20){
            posicaoY = window.innerHeight;
        }
        particula.style.top = posicaoY + "px";
    },30);
}

const camposFormulario = document.querySelectorAll("input");
camposFormulario.forEach(campo => {

    campo.addEventListener("focus", () => {
        campo.style.transform = "scale(1.03)";
    });

    campo.addEventListener("blur", () => {
        campo.style.transform = "scale(1)";
    });
});

const logoHamburgueria = document.getElementById("logoHamburgueria");

setInterval(() => {

    logoHamburgueria.animate(
    [
        {transform:"translateY(0px)"},
        {transform:"translateY(-10px)"},
        {transform:"translateY(0px)"}
    ],
    {
        duration:2000
    });

},2000);





// Sistema para a ação de visualizar a senha e esconder a senha "cadastro"
const campoSenha =
document.getElementById("senhaCliente");

const campoConfirmacaoSenha =
document.getElementById("confirmacaoSenhaCliente");

const visualizarSenha =
document.getElementById("visualizarSenha");

const visualizarConfirmacaoSenha =
document.getElementById("visualizarConfirmacaoSenha");

visualizarSenha.addEventListener("click", () => {

    if(campoSenha.type === "password"){

        campoSenha.type = "text";
        visualizarSenha.textContent = "🐵";

    }else{

        campoSenha.type = "password";
        visualizarSenha.textContent = "🙈";

    }

});

visualizarConfirmacaoSenha.addEventListener("click", () => {

    if(campoConfirmacaoSenha.type === "password"){
        campoConfirmacaoSenha.type = "text";
        visualizarConfirmacaoSenha.textContent = "🐵";

    }else{
        campoConfirmacaoSenha.type = "password";
        visualizarConfirmacaoSenha.textContent = "🙈";

    }
});





// Validação do "confirmar senha" para conferir se as senhas coinsidem
const formulario =
document.getElementById("formularioCadastro");

formulario.addEventListener("submit", (evento) => {

    if(campoSenha.value !== campoConfirmacaoSenha.value){

        evento.preventDefault();

        alert("As senhas não coincidem!");
    }
});





// Verifica se o cadastro foi realizado e redireciona para a HomePage
const parametrosURL = new URLSearchParams(window.location.search);

if (parametrosURL.get('sucesso') === 'true') {
    const nome = parametrosURL.get('nome') || 'Usuário';

    // Guarda o nome no localStorage pra usar na HomePage
    localStorage.setItem('nomeUsuario', nome);

    // Troca o botão pela mensagem
    const botaoCriarConta = document.getElementById('botaoCriarConta');
    const mensagemSucesso = document.getElementById('mensagemSucesso');
    botaoCriarConta.style.display = 'none';
    mensagemSucesso.style.display = 'block';

    // Redireciona pra HomePage após 2.5 segundos
    setTimeout(() => {
        window.location.href = '/';
    }, 2500);
}