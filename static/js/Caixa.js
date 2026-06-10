document.addEventListener("DOMContentLoaded", () => {

    const cargo = localStorage.getItem("cargo");

    // Bloqueia acesso se não for funcionário ou chefe
    if (cargo !== "funcionario" && cargo !== "chefe") {
        window.location.href = "/menu";
        return;
    }

    let todosPedidos = [];

    carregarCaixa();
    iniciarParticulas();

    // Filtro de busca
    document.getElementById("inputBuscaCaixa")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const filtrados = todosPedidos.filter(p =>
            p.codigo_pedido.toLowerCase().includes(termo) ||
            p.nome_cliente.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo)
        );
        renderizarTabela(filtrados);
    });


    async function carregarCaixa() {
        try {
            const resposta = await fetch("/api/caixa");
            if (!resposta.ok) throw new Error();

            todosPedidos = await resposta.json();

            document.getElementById("loadingCaixa").classList.add("escondido");
            document.getElementById("tabelaHistorico").classList.remove("escondido");

            calcularContadores(todosPedidos);
            renderizarTabela(todosPedidos);

        } catch {
            document.getElementById("loadingCaixa").classList.add("escondido");
            document.getElementById("erroCaixa").classList.remove("escondido");
        }
    }


    function calcularContadores(pedidos) {
        const formatar = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        const pix      = pedidos.filter(p => p.forma_pagamento === "pix");
        const credito  = pedidos.filter(p => p.forma_pagamento === "credito");
        const boleto   = pedidos.filter(p => p.forma_pagamento === "boleto");

        const somarValor = (lista) => lista.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);

        document.getElementById("qtdPix").textContent      = pix.length;
        document.getElementById("valorPix").textContent    = formatar(somarValor(pix));
        document.getElementById("qtdCredito").textContent  = credito.length;
        document.getElementById("valorCredito").textContent = formatar(somarValor(credito));
        document.getElementById("qtdBoleto").textContent   = boleto.length;
        document.getElementById("valorBoleto").textContent = formatar(somarValor(boleto));

        const totalGeral = somarValor(pedidos);
        document.getElementById("valorTotalGeral").textContent = formatar(totalGeral);
    }


    function renderizarTabela(pedidos) {
        const corpo = document.getElementById("corpoTabelaHistorico");
        corpo.innerHTML = "";

        const formatar = (v) => parseFloat(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        const labels   = { pix: "PIX", credito: "Cartão de Crédito", boleto: "Boleto Bancário" };

        pedidos.forEach(pedido => {
            const tr = document.createElement("tr");

            const data = new Date(pedido.criado_em.replace(" ", "T"));
            const dataFormatada = data.toLocaleString("pt-BR", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            });

            tr.innerHTML = `
                <td><span class="codigoBadge">#${pedido.codigo_pedido}</span></td>
                <td>${pedido.nome_cliente}</td>
                <td class="tdDescricao">${pedido.descricao}</td>
                <td>${pedido.endereco}</td>
                <td><span class="pagamentoBadge pagamento-${pedido.forma_pagamento}">${labels[pedido.forma_pagamento] || pedido.forma_pagamento}</span></td>
                <td class="tdValor">${formatar(pedido.valor)}</td>
                <td>${dataFormatada}</td>
            `;

            corpo.appendChild(tr);
        });

        if (pedidos.length === 0) {
            corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#666; padding:30px;">Nenhum pedido encontrado.</td></tr>`;
        }
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