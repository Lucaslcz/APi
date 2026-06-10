async function abrirModalStatus() {
    document.getElementById("overlayStatus").classList.add("visivel");
    document.getElementById("modalStatus").classList.add("visivel");
    document.body.style.overflow = "hidden";
    await carregarStatusAtual();
}

function fecharModalStatus() {
    document.getElementById("overlayStatus").classList.remove("visivel");
    document.getElementById("modalStatus").classList.remove("visivel");
    document.body.style.overflow = "";
}

async function carregarStatusAtual() {
    try {
        const resposta = await fetch("/api/status");
        const dados    = await resposta.json();
        aplicarStatusNoModal(dados.valor);
        atualizarStatusHeader(dados.valor);
    } catch {
        console.error("Erro ao carregar status do estabelecimento");
    }
}


function aplicarStatusNoModal(status) {
    const label      = document.getElementById("statusAtualLabel");
    const indicador  = document.getElementById("statusAtualIndicador");
    const btnAbrir   = document.getElementById("btnAbrirEstabelecimento");
    const btnFechar  = document.getElementById("btnFecharEstabelecimento");

    if (!label) return;

    if (status === "aberto") {
        label.textContent = "Aberto";
        label.className   = "statusAberto";
        indicador.className = "indicadorAberto";
        btnAbrir.classList.add("ativo");
        btnFechar.classList.remove("ativo");
    } else {
        label.textContent = "Fechado";
        label.className   = "statusFechado";
        indicador.className = "indicadorFechado";
        btnFechar.classList.add("ativo");
        btnAbrir.classList.remove("ativo");
    }
}

async function alterarStatus(novoStatus) {
    try {
        const resposta = await fetch("/api/status/alterar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor: novoStatus })
        });
        const dados = await resposta.json();
        if (dados.ok) {
            aplicarStatusNoModal(novoStatus);
            atualizarStatusHeader(novoStatus);
        }

    } catch {
        console.error("Erro ao alterar status");
    }
}


// VERIFICAÇÃO NAS PÁGINAS BLOQUEADAS
// (cardapio.html, promocoes.html, finalizar.html)
async function verificarEstabelecimento() {
    const cargo = localStorage.getItem("cargo");

    // Chefe passa sempre
    if (cargo === "chefe") return;

    try {
        const resposta = await fetch("/api/status");
        const dados    = await resposta.json();

        if (dados.valor === "fechado") {
            mostrarPopupFechado();
        }
    } catch {
    }
}

function mostrarPopupFechado() {
    const overlay = document.getElementById("overlayFechado");
    const popup   = document.getElementById("popupFechado");
    if (!overlay || !popup) return;

    overlay.classList.add("visivel");
    popup.classList.add("visivel");
    document.body.style.overflow = "hidden";
}


// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {

    // Botão de abrir modal (menu.html)
    document.getElementById("botaoFecharEstabelecimento")
        ?.addEventListener("click", abrirModalStatus);

    // Fechar modal
    document.getElementById("fecharModalStatus")
        ?.addEventListener("click", fecharModalStatus);
    document.getElementById("overlayStatus")
        ?.addEventListener("click", fecharModalStatus);

    // Botões de abrir/fechar estabelecimento
    document.getElementById("btnAbrirEstabelecimento")
        ?.addEventListener("click", () => alterarStatus("aberto"));
    document.getElementById("btnFecharEstabelecimento")
        ?.addEventListener("click", () => alterarStatus("fechado"));

    // Verifica se está fechado (nas páginas bloqueadas)
    if (document.getElementById("overlayFechado")) {
        verificarEstabelecimento();
    }

});