(function () {
    "use strict";

    const STATUS_CONFIG = {
        preparando: {
            badgeLabel: "Preparando",
            titulo:     "Pedido em Preparo 🍳",
            subtitulo:  "Nossos chefs estão caprichando no seu pedido. Logo mais estará pronto!",
        },
        rota: {
            badgeLabel: "A caminho",
            titulo:     "Saiu para Entrega! 🏍️",
            subtitulo:  "Seu pedido está a caminho. Prepare o estômago!",
        },
        entregue: {
            badgeLabel: "Entregue ✓",
            titulo:     "Pedido Entregue! 🎉",
            subtitulo:  "Bom apetite! Esperamos que esteja delicioso. Obrigado pela preferência! 🍔",
        },
    };

    const ETAPAS_POR_STATUS = {
        preparando: ["ativa-preparando", "ativa-preparando", null,          null],
        rota:       ["concluida",        "concluida",        "ativa-rota",  null],
        entregue:   ["concluida",        "concluida",        "concluida",   "ativa-entregue"],
    };

    const LINHAS_POR_STATUS = {
        preparando: [null,    null,   null],
        rota:       ["ativa", "azul", null],
        entregue:   ["verde", "verde","verde"],
    };

    const badge      = document.getElementById("badgePedidoAtivo");
    const badgeCod   = document.getElementById("badgeCodigo");
    const badgeSt    = document.getElementById("badgeStatus");
    const overlay    = document.getElementById("overlayStatusPedido");
    const codigoVal  = document.getElementById("statusCodigoValor");
    const titulo     = document.getElementById("statusTitulo");
    const subtitulo  = document.getElementById("statusSubtitulo");
    const btnFechar1 = document.getElementById("btnFecharStatus");
    const btnFechar2 = document.getElementById("btnFecharStatusBottom");

    const etapaEls = [
        document.getElementById("setapa0"),
        document.getElementById("setapa1"),
        document.getElementById("setapa2"),
        document.getElementById("setapa3"),
    ];

    const linhaEls = [
        document.getElementById("slinha0"),
        document.getElementById("slinha1"),
        document.getElementById("slinha2"),
    ];

    let ultimoStatus = null;

    function lerPedido() {
        try {
            return JSON.parse(localStorage.getItem("pedidoAtivoCalabreso") || "null");
        } catch {
            return null;
        }
    }

    function renderizarBadge(pedido) {
    if (!badge || !pedido?.codigo) return;
    
    // Se o usuário desligou o status do pedido, esconde e para
    if (localStorage.getItem('notifPedido') === 'false') {
        badge.style.display = 'none';
        return;
    }
    
    const cfg = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.preparando;
    badge.className = "";
    badge.classList.add("status-" + pedido.status);
    badge.style.display = "block";
    if (badgeCod) badgeCod.textContent = pedido.codigo;
    if (badgeSt)  badgeSt.textContent  = cfg.badgeLabel;
}

    function abrirPopupStatus() {
        const pedido = lerPedido();
        if (!pedido) return;

        const cfg    = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.preparando;
        const etapas = ETAPAS_POR_STATUS[pedido.status] || ETAPAS_POR_STATUS.preparando;
        const linhas = LINHAS_POR_STATUS[pedido.status] || LINHAS_POR_STATUS.preparando;

        if (codigoVal) codigoVal.textContent = pedido.codigo;
        if (titulo)    titulo.textContent    = cfg.titulo;
        if (subtitulo) subtitulo.textContent = cfg.subtitulo;

        etapaEls.forEach((el, i) => {
            if (!el) return;
            el.className = "statusEtaItem";
            if (etapas[i]) el.classList.add(etapas[i]);
        });

        linhaEls.forEach((el, i) => {
            if (!el) return;
            el.className = "statusEtaLinha";
            if (linhas[i]) el.classList.add(linhas[i]);
        });

        overlay.className = "";
        overlay.classList.add("status-" + pedido.status);
        overlay.classList.add("visivel");
    }

    function fecharPopup() {
        overlay?.classList.remove("visivel");
    }

    function init() {
        const pedido = lerPedido();
        if (pedido?.codigo) renderizarBadge(pedido);

        badge?.addEventListener("click", abrirPopupStatus);
        btnFechar1?.addEventListener("click", fecharPopup);
        btnFechar2?.addEventListener("click", fecharPopup);

        overlay?.addEventListener("click", (e) => {
            if (e.target === overlay) fecharPopup();
        });

        // Único intervalo — avança status baseado nos timestamps salvos
        setInterval(() => {
            const p = lerPedido();
            if (!p) return;

            const agora = Date.now();

            if (p.status === "preparando" && agora >= p.tsRota) {
                p.status = "rota";
                localStorage.setItem("pedidoAtivoCalabreso", JSON.stringify(p));
            } else if (p.status === "rota" && agora >= p.tsEntregue) {
                p.status = "entregue";
                localStorage.setItem("pedidoAtivoCalabreso", JSON.stringify(p));
            } else if (p.status === "entregue" && agora >= p.tsSumirEm) {
                localStorage.removeItem("pedidoAtivoCalabreso");
                if (badge) badge.style.display = "none";
                fecharPopup();
                return;
            }

            if (p.status !== ultimoStatus) {
                ultimoStatus = p.status;
                renderizarBadge(p);
            }
        }, 2000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();