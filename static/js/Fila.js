document.addEventListener("DOMContentLoaded", () => {

    const cargo = localStorage.getItem("cargo");

    // Bloqueia acesso se não for funcionário ou chefe
    if (cargo !== "funcionario" && cargo !== "chefe") {
        window.location.href = "/menu";
        return;
    }

    const ehChefe = cargo === "chefe";
    let codigoParaCancelar = null;

    carregarFila();
    iniciarParticulas();

    // Atualiza a fila automaticamente a cada 5 segundos
    setInterval(carregarFila, 5000);

    async function carregarFila() {
        try {
            const resposta = await fetch("/api/fila/pedidos");
            if (!resposta.ok) throw new Error();

            const pedidos = await resposta.json();

            document.getElementById("loadingFila").classList.add("escondido");
            document.getElementById("erroFila").classList.add("escondido");

            atualizarContadores(pedidos);
            renderizarFila(pedidos);

        } catch {
            document.getElementById("loadingFila").classList.add("escondido");
            document.getElementById("erroFila").classList.remove("escondido");
        }
    }

    function atualizarContadores(pedidos) {
        document.getElementById("qtdPreparando").textContent = pedidos.filter(p => p.status === "preparando").length;
        document.getElementById("qtdRota").textContent       = pedidos.filter(p => p.status === "rota").length;
        document.getElementById("qtdCancelado").textContent  = pedidos.filter(p => p.status === "cancelado").length;
    }

    function formatarValor(v) {
        return parseFloat(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    const labelStatus = {
        preparando: "Preparando",
        rota:       "Em rota",
        cancelado:  "Cancelado"
    };

    function renderizarFila(pedidos) {
        const lista = document.getElementById("listaFila");
        lista.querySelectorAll(".cardFila").forEach(el => el.remove());

        if (pedidos.length === 0) {
            document.getElementById("filaVazia").classList.remove("escondido");
            return;
        }

        document.getElementById("filaVazia").classList.add("escondido");

        const template = document.getElementById("templateCardFila");
        const fragmento = document.createDocumentFragment();

        pedidos.forEach(pedido => {
            const clone = template.content.cloneNode(true);
            const card  = clone.querySelector(".cardFila");

            card.querySelector(".codigoFilaPedido").textContent = pedido.codigo_pedido;
            card.querySelector(".nomeClienteFila").textContent  = pedido.nome_cliente;
            card.querySelector(".descricaoFilaPedido").textContent = pedido.descricao;
            card.querySelector(".enderecoFilaPedido").textContent  = pedido.endereco;
            card.querySelector(".valorFilaPedido").textContent     = formatarValor(pedido.valor);

            const data = new Date(pedido.criado_em.replace(" ", "T"));
            card.querySelector(".horaFilaPedido").textContent = data.toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit"
            });

            const badge = card.querySelector(".statusFilaBadge");
            badge.textContent = labelStatus[pedido.status] || pedido.status;
            badge.classList.add("status-" + pedido.status);

            // Só o chefe vê o botão de cancelar, e só pra pedidos ainda ativos
            const btnCancelar = card.querySelector(".btnCancelarFila");
            if (ehChefe && (pedido.status === "preparando" || pedido.status === "rota")) {
                btnCancelar.classList.remove("escondido");
                btnCancelar.addEventListener("click", () => abrirConfirmacaoCancelar(pedido.codigo_pedido));
            } else {
                btnCancelar.remove();
            }

            fragmento.appendChild(clone);
        });

        lista.appendChild(fragmento);
    }

    function abrirConfirmacaoCancelar(codigo) {
        codigoParaCancelar = codigo;
        document.getElementById("codigoConfirmCancelarFila").textContent = "#" + codigo;
        document.getElementById("overlayConfirmCancelarFila").classList.add("visivel");
        document.getElementById("popupConfirmCancelarFila").classList.add("visivel");
        document.body.style.overflow = "hidden";
    }

    function fecharConfirmacaoCancelar() {
        codigoParaCancelar = null;
        document.getElementById("overlayConfirmCancelarFila").classList.remove("visivel");
        document.getElementById("popupConfirmCancelarFila").classList.remove("visivel");
        document.body.style.overflow = "";
    }

    document.getElementById("btnVoltarCancelarFila")?.addEventListener("click", fecharConfirmacaoCancelar);
    document.getElementById("overlayConfirmCancelarFila")?.addEventListener("click", (e) => {
        if (e.target.id === "overlayConfirmCancelarFila") fecharConfirmacaoCancelar();
    });

    document.getElementById("btnConfirmarCancelarFila")?.addEventListener("click", async () => {
        if (!codigoParaCancelar) return;

        const btn = document.getElementById("btnConfirmarCancelarFila");
        btn.disabled = true;

        try {
            const resposta = await fetch(`/api/fila/cancelar/${codigoParaCancelar}`, { method: "POST" });
            const resultado = await resposta.json();

            if (!resposta.ok || resultado.erro) {
                throw new Error(resultado.erro || "Erro ao cancelar pedido.");
            }

            mostrarToastFila(`Pedido #${codigoParaCancelar} cancelado.`);
            fecharConfirmacaoCancelar();
            carregarFila();

        } catch (erro) {
            mostrarToastFila(erro.message);
        } finally {
            btn.disabled = false;
        }
    });

    function mostrarToastFila(msg) {
        const toast = document.getElementById("toastFilaPedidos");
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("visivel");
        setTimeout(() => toast.classList.remove("visivel"), 3000);
    }

    function iniciarParticulas() {
        const canvas = document.getElementById("efeitoParticulas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const particulas = [];

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        for (let i = 0; i < 50; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - .5) * .4,
                vy: (Math.random() - .5) * .4,
                r: Math.random() * 2 + 1,
                alpha: Math.random() * .25 + .05
            });
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 165, 0, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(loop);
        }
        loop();
    }

});