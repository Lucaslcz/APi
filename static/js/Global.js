// Sincroniza o localStorage com a sessão real do servidor.
// Se o token expirou ou foi removido, desloga o usuário no front também.
async function sincronizarSessao() {
    try {
        const resposta = await fetch('/api/me');

        if (resposta.status === 401) {
            localStorage.removeItem('nomeUsuario');
            localStorage.removeItem('idUsuario');
            localStorage.removeItem('cargo');
            return;
        }

        const dados = await resposta.json();

        if (dados.logado) {
            localStorage.setItem('nomeUsuario', dados.nome);
            localStorage.setItem('idUsuario', dados.id);
            localStorage.setItem('cargo', dados.cargo);
        }
    } catch {
        // Falha de rede: mantém o que já está salvo no localStorage
    }
}


// Efeito de clique no botão de menu
const botaoMenu = document.getElementById("botaoMenu");

if (botaoMenu) {
    botaoMenu.addEventListener("click", e => {
        const circulo = document.createElement("span");

        circulo.classList.add("efeitoClique");

        const tamanho = Math.max(
            botaoMenu.clientWidth,
            botaoMenu.clientHeight
        );

        circulo.style.width = tamanho + "px";
        circulo.style.height = tamanho + "px";

        const rect = botaoMenu.getBoundingClientRect();

        circulo.style.left =
            e.clientX - rect.left - tamanho / 2 + "px";

        circulo.style.top =
            e.clientY - rect.top - tamanho / 2 + "px";

        botaoMenu.appendChild(circulo);

        setTimeout(() => {
            circulo.remove();
        }, 450);
    });
}





// Cria o popup de "faça login primeiro" e injeta no body
function criarPopupLogin() {
    if (document.getElementById('popupLoginOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'popupLoginOverlay';

    overlay.innerHTML = `
        <div id="popupLoginCaixa">
            <div id="popupLoginIcone">🔒</div>
            <h2 id="popupLoginTitulo">Acesso restrito</h2>
            <p id="popupLoginMensagem">Faça login antes de continuar com essa ação.</p>
            <div id="popupLoginBotoes">
                <button id="popupBotaoLogin">Fazer Login</button>
                <button id="popupBotaoFechar">Agora não</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visivel'));

    document.getElementById('popupBotaoLogin').addEventListener('click', () => {
        window.location.href = '/login';
    });

    document.getElementById('popupBotaoFechar').addEventListener('click', () => {
        fecharPopupLogin();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharPopupLogin();
    });
}

function fecharPopupLogin() {
    const overlay = document.getElementById('popupLoginOverlay');
    if (!overlay) return;
    overlay.classList.remove('visivel');
    setTimeout(() => overlay.remove(), 300);
}

// Verifica se está logado
function estaLogado() {
    return !!localStorage.getItem('nomeUsuario');
}

// Intercepta o clique e bloqueia se não estiver logado
function protegerBotao(seletor, acao) {
    const el = document.querySelector(seletor);
    if (!el) return;

    el.addEventListener('click', (e) => {
        if (!estaLogado()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            criarPopupLogin();
            return;
        }
        if (acao) acao();
    }, true);
}


// Rotas para o flask
document.addEventListener("DOMContentLoaded", () => {

    sincronizarSessao();

    const botaoLogin     = document.getElementById("botaoLogin");
    const botaoCadastrar = document.getElementById("botaoCadastrar");
    const botaoLogar     = document.getElementById("botaoLogar");
    const botaoVoltar    = document.getElementById("botaoVoltar");
    const botaoCardapio  = document.getElementById("botaoCardapio");
    const botaoPromocoes = document.getElementById("botaoPromocoes");
    const botaoFinalizar = document.getElementById("botaoFinalizar");
    const botaoHistorico = document.getElementById("botaoHistorico");
    const botaoCaixa = document.getElementById("botaoCaixa");
    const botaoEmpresa = document.getElementById("botaoEmpresa");
    const botaoInicio = document.getElementById("botaoInicio");

    if (botaoLogin) {
        botaoLogin.addEventListener("click", () => {
            window.location.href = "/login";
        });
    }

    if (botaoCadastrar) {
        botaoCadastrar.addEventListener("click", () => {
            window.location.href = "/cadastro";
        });
    }

    if (botaoLogar) {
        botaoLogar.addEventListener("click", () => {
            window.location.href = "/login";
        });
    }

    if (botaoVoltar) {
        botaoVoltar.addEventListener("click", () => {
            window.location.href = "/";
        });
    }

    if (botaoCardapio) {
        botaoCardapio.addEventListener("click", () => {
            window.location.href = "/cardapio";
        });
    }

    if (botaoPromocoes) {
        botaoPromocoes.addEventListener("click", () => {
            window.location.href = "/promocoes";
        });
    }

    if (botaoFinalizar) {
        botaoFinalizar.addEventListener("click", () => {
            window.location.href = "/finalizar";
        });
    }

    if (botaoHistorico) {
        botaoHistorico.addEventListener("click", () => {
            window.location.href = "/historico";
        });
    }

    if (botaoCaixa) {
        botaoCaixa.addEventListener("click", () => {
            window.location.href = "/caixa";
        });
    }

    if (botaoEmpresa) {
        botaoEmpresa.addEventListener("click", () => {
            window.location.href = "/empresa";
        });
    }

    if (botaoInicio) {
        botaoInicio.addEventListener("click", () => {
            window.location.href = "/";
        });
    }


    // Botões protegidos (bloqueados sem login)
    protegerBotao('#botaoMenu',     () => { window.location.href = "/menu"; });
    protegerBotao('#botaoCarrinho',                    null);
    protegerBotao('.btn-banner.btn-laranja',           null);
    protegerBotao('.btn-banner.btn-verde',             null);
    protegerBotao('.btn-ver-todas',                    null);
    protegerBotao('.rodapeColuna a[href="cardapio"]',  null);
    protegerBotao('.rodapeColuna a[href="promocoes"]', null);

});

function atualizarStatusHeader(status) {
    const bolinha = document.getElementById("bolinhaStatus");
    const texto   = document.getElementById("textoStatus");
    if (!bolinha || !texto) return;

    if (status === "aberto") {
        bolinha.style.background  = "#00e676";
        bolinha.style.boxShadow   = "0 0 10px #00e676";
        texto.textContent = "Aberto";
    } else {
        bolinha.style.background  = "#ff4d4d";
        bolinha.style.boxShadow   = "0 0 10px #ff4d4d";
        texto.textContent = "Fechado";
    }
}

async function sincronizarStatusHeader() {
    try {
        const resposta = await fetch("/api/status");
        const dados = await resposta.json();
        atualizarStatusHeader(dados.valor);
    } catch {
        console.error("Erro ao sincronizar status");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    sincronizarStatusHeader();
    setInterval(sincronizarStatusHeader, 10000);
});