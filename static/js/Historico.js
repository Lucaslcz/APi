document.addEventListener("DOMContentLoaded", () => {

    const idUsuario = localStorage.getItem("idUsuario");

    // Se não estiver logado, manda pro login
    if (!idUsuario) {
        window.location.href = "/login";
        return;
    }

    // ← DECLARADOS AQUI, acessíveis em todas as funções abaixo
    const lista    = document.getElementById("listaHistorico");
    const template = document.getElementById("templateCard");

    let todosPedidos = [];

    carregarHistorico();
    iniciarParticulas();

    document.getElementById("botaoVoltar")?.addEventListener("click", () => {
        window.history.back();
    });

    // Filtra os cards conforme o usuário digita
    document.getElementById("inputBusca")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const filtrados = todosPedidos.filter(p =>
            p.codigo_pedido.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo) ||
            p.endereco.toLowerCase().includes(termo)
        );
        renderizarCards(filtrados);
    });


    async function carregarHistorico() {
        try {
            const resposta = await fetch(`/api/historico/${idUsuario}`);
            if (!resposta.ok) throw new Error();

            todosPedidos = await resposta.json();

            document.getElementById("loadingHistorico").classList.add("escondido");

            if (todosPedidos.length === 0) {
                document.getElementById("historicoVazio").classList.remove("escondido");
                return;
            }

            atualizarStats(todosPedidos);
            renderizarCards(todosPedidos);

        } catch {
            document.getElementById("loadingHistorico").classList.add("escondido");
            document.getElementById("erroHistorico").classList.remove("escondido");
        }
    }


    function atualizarStats(pedidos) {
        document.getElementById("statTotalPedidos").textContent = pedidos.length;

        const mais_recente = pedidos[0]?.criado_em;
        if (mais_recente) {
            const data = new Date(mais_recente);
            document.getElementById("statUltimoPedido").textContent =
                data.toLocaleDateString("pt-BR", { 
                    day: "2-digit", 
                    month: "short",
                    timeZone: "America/Sao_Paulo" 
                });
        }
    }


    function renderizarCards(pedidos) {
        // Limpa cards anteriores antes de re-renderizar (importante pro filtro)
        lista.querySelectorAll(".cardHistorico").forEach(c => c.remove());

        pedidos.forEach((pedido, i) => {
            const clone = template.content.cloneNode(true);
            const card  = clone.querySelector(".cardHistorico");

            card.style.animationDelay = (i * 0.06) + "s";

            card.querySelector(".codigoPedido").textContent    = pedido.codigo_pedido;
            card.querySelector(".descricaoPedido").textContent = pedido.descricao;
            card.querySelector(".enderecoPedido").textContent  = pedido.endereco;

            const labels = { pix: "PIX", credito: "Cartão de Crédito", boleto: "Boleto Bancário" };
            card.querySelector(".pagamentoPedido").textContent = labels[pedido.forma_pagamento] || pedido.forma_pagamento;

            const data = new Date(pedido.criado_em.replace(" ", "T"));
            card.querySelector(".cardHistorico-data").textContent =
                data.toLocaleString("pt-BR", { 
                    day: "2-digit", 
                    month: "short", 
                    year: "numeric", 
                    hour: "2-digit", 
                    minute: "2-digit",
                    timeZone: "America/Sao_Paulo"
                });

            lista.appendChild(clone);
        });
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
                x:     Math.random() * canvas.width,
                y:     Math.random() * canvas.height,
                vx:    (Math.random() - .5) * .4,
                vy:    (Math.random() - .5) * .4,
                r:     Math.random() * 2 + 1,
                alpha: Math.random() * .25 + .05
            });
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0)             p.x = canvas.width;
                if (p.x > canvas.width)  p.x = 0;
                if (p.y < 0)             p.y = canvas.height;
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