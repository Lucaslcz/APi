async function aplicarCargo() {
    const idUsuario = localStorage.getItem("idUsuario");
    if (!idUsuario) return;

    const cargo = localStorage.getItem("cargo");

    if (cargo === "funcionario" || cargo === "chefe") {
        document.querySelectorAll(".cartaoFuncionario").forEach(el => {
            el.classList.remove("escondido");
        });
    }

    if (cargo === "chefe") {
        document.querySelectorAll(".cartaoChefe").forEach(el => {
            el.classList.remove("escondido");
        });
    }
}

function inicializarAnimacoes() {
    const cartoesMenu = document.querySelectorAll(".cartaoMenu");

    cartoesMenu.forEach(cartao => {
        cartao.addEventListener("mousemove", (evento) => {
            const rect = cartao.getBoundingClientRect();
            const x = evento.clientX - rect.left;
            const y = evento.clientY - rect.top;
            const centroX = rect.width / 2;
            const centroY = rect.height / 2;
            const rotacaoY = ((x - centroX) / centroX) * 8;
            const rotacaoX = -((y - centroY) / centroY) * 8;
            cartao.style.transform = `
                perspective(1000px)
                rotateX(${rotacaoX}deg)
                rotateY(${rotacaoY}deg)
                translateY(-8px)
            `;
        });

        cartao.addEventListener("mouseleave", () => {
            cartao.style.transform = "";
        });

        cartao.addEventListener("mousedown", () => {
            cartao.classList.add("ativo");
        });

        cartao.addEventListener("mouseup", () => {
            cartao.classList.remove("ativo");
        });
    });
}

async function verificarAntesDeNavegar(url) {
    const cargo = localStorage.getItem("cargo");

    if (cargo === "chefe") {
        window.location.href = url;
        return;
    }

    const resposta = await fetch("/api/status");
    const dados = await resposta.json();

    if (dados.valor === "fechado") {
        mostrarPopupFechado();
    } else {
        window.location.href = url;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await aplicarCargo();
    inicializarAnimacoes();

    document.getElementById("botaoCardapio")
        ?.addEventListener("click", () => verificarAntesDeNavegar("/cardapio"));

    document.getElementById("botaoPromocoes")
        ?.addEventListener("click", () => verificarAntesDeNavegar("/promocoes"));

    document.getElementById("botaoFinalizar")
        ?.addEventListener("click", () => verificarAntesDeNavegar("/finalizar"));
});