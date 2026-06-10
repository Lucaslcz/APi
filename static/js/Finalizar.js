document.addEventListener("DOMContentLoaded", () => {

    iniciarParticulas();

    // ── VENCIMENTO DO BOLETO ──
    const venc = document.getElementById("vencimentoBoleto");
    if (venc) {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        venc.textContent = d.toLocaleDateString("pt-BR");
    }


    // RESUMO DO PEDIDO — lê do localStorage
    const itens = JSON.parse(localStorage.getItem("carrinhoCalabreso") || "[]");

    const listaEl       = document.getElementById("listaItensPedido");
    const subtotalEl    = document.getElementById("valorSubtotal");
    const totalFinalEl  = document.getElementById("valorTotalFinal");
    const boletoValorEl = document.querySelector("#infoBoleto .linhaBoleto:last-child strong");
    const parcelasEl    = document.getElementById("selectParcelas");

    function formatar(valor) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    if (listaEl) {
        listaEl.innerHTML = "";

        if (itens.length === 0) {
            listaEl.innerHTML = `
                <p style="color:#666; font-size:.9rem; text-align:center; padding:20px 0;">
                    Nenhum item no carrinho.
                </p>`;
            if (subtotalEl)   subtotalEl.textContent  = "R$ 0,00";
            if (totalFinalEl) totalFinalEl.textContent = "R$ 0,00";
        } else {
            itens.forEach((item, i) => {
                const div = document.createElement("div");
                div.classList.add("itemPedido");
                div.style.animationDelay = (i * 0.05) + "s";
                div.innerHTML = `
                    <span class="qtdItem">${item.quantidade}x</span>
                    <span class="nomeItem">${item.nome}</span>
                    <span class="precoItem">${formatar(item.preco * item.quantidade)}</span>
                `;
                listaEl.appendChild(div);
            });

            const subtotal = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

            if (subtotalEl)   subtotalEl.textContent  = formatar(subtotal);
            if (totalFinalEl) totalFinalEl.textContent = formatar(subtotal);
            if (boletoValorEl) boletoValorEl.textContent = formatar(subtotal);

            if (parcelasEl) {
                parcelasEl.innerHTML = "";
                [1, 2, 3].forEach(n => {
                    const opt = document.createElement("option");
                    opt.value = n;
                    opt.textContent = `${n}x de ${formatar(subtotal / n)} sem juros`;
                    parcelasEl.appendChild(opt);
                });
            }
        }
    }


    // ABAS DE PAGAMENTO
    const abas    = document.querySelectorAll(".abaPagamento");
    const paineis = document.querySelectorAll(".painelPagamento");

    abas.forEach(aba => {
        aba.addEventListener("click", () => {
            abas.forEach(a => a.classList.remove("ativa"));
            paineis.forEach(p => p.classList.remove("ativo"));
            aba.classList.add("ativa");
            const painel = document.getElementById("painel" + capitalizar(aba.dataset.metodo));
            if (painel) painel.classList.add("ativo");
        });
    });

    function capitalizar(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    // COPIAR CHAVE PIX
    const btnCopiar = document.getElementById("btnCopiarPix");
    if (btnCopiar) {
        btnCopiar.addEventListener("click", () => {
            const chave = document.getElementById("textoChavePix").textContent;
            navigator.clipboard.writeText(chave).then(() => {
                btnCopiar.innerHTML = '<i class="fa-solid fa-check"></i>';
                btnCopiar.classList.add("copiado");
                setTimeout(() => {
                    btnCopiar.innerHTML = '<i class="fa-regular fa-copy"></i>';
                    btnCopiar.classList.remove("copiado");
                }, 2000);
            });
        });
    }


    // MÁSCARA DO CARTÃO
    const inputNumCartao = document.getElementById("inputNumCartao");
    if (inputNumCartao) {
        inputNumCartao.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "").substring(0, 16);
            v = v.replace(/(.{4})/g, "$1 ").trim();
            e.target.value = v;
            const display = document.getElementById("numeroCartao");
            if (display) {
                const partes = v.padEnd(19, "•").split(" ");
                display.textContent = partes.map(p => p.padEnd(4, "•")).join(" ");
            }
        });
    }

    const inputNomeCartao = document.getElementById("inputNomeCartao");
    if (inputNomeCartao) {
        inputNomeCartao.addEventListener("input", (e) => {
            const display = document.getElementById("nomeCartao");
            if (display) display.textContent = e.target.value.toUpperCase() || "NOME DO TITULAR";
        });
    }

    const inputValidade = document.getElementById("inputValidade");
    if (inputValidade) {
        inputValidade.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "").substring(0, 4);
            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
            e.target.value = v;
            const display = document.getElementById("validadeCartao");
            if (display) display.textContent = v || "MM/AA";
        });
    }


    // BOTÕES CONFIRMAR
    const botoes = document.querySelectorAll(".btnConfirmarPagamento");

    botoes.forEach(btn => {
        btn.addEventListener("click", () => {
            const rua    = document.getElementById("inputRua")?.value.trim();
            const numero = document.getElementById("inputNumero")?.value.trim();

            if (!rua || !numero) {
                chacoalharCampo("inputRua");
                mostrarToast("Preencha o endereço de entrega primeiro! 📍");
                return;
            }

            const abaAtiva = document.querySelector(".abaPagamento.ativa")?.dataset.metodo;
            if (abaAtiva === "credito") {
                const numCard = document.getElementById("inputNumCartao")?.value.replace(/\s/g, "");
                if (!numCard || numCard.length < 16) {
                    chacoalharCampo("inputNumCartao");
                    mostrarToast("Número do cartão inválido 💳");
                    return;
                }
            }

            if (itens.length === 0) {
                mostrarToast("Seu carrinho está vazio! 🛒");
                return;
            }

            const textoOriginal = btn.innerHTML;
            btn.classList.add("carregando");
            btn.innerHTML = '<i class="fa-solid fa-spinner"></i> Processando...';

            setTimeout(() => {
                btn.innerHTML = textoOriginal;
                btn.classList.remove("carregando");
                abrirPopupAprovado();
            }, 2200);
        });
    });


    // POPUP DE APROVADO
    function abrirPopupAprovado() {
        const overlay   = document.getElementById("overlayAprovado");
        const numPedido = document.getElementById("numPedidoValor");

        const codigo = String(Math.floor(Math.random() * 90000) + 10000);

        const tempoPreparo = itens.reduce((acc, i) => acc + (i.tempo_preparo || 600) * i.quantidade, 0) * 1000;
        const agora        = Date.now();

        const pedido = {
            codigo:     codigo,
            status:     "preparando",
            metodo:     document.querySelector(".abaPagamento.ativa")?.dataset.metodo || "pix",
            timestamp:  agora,
            tsRota:     agora + tempoPreparo,
            tsEntregue: agora + tempoPreparo + 20000,
            tsSumirEm:  agora + tempoPreparo + 30000
        };

        localStorage.setItem("pedidoAtivoCalabreso", JSON.stringify(pedido));
        localStorage.removeItem("carrinhoCalabreso");

        if (numPedido) numPedido.textContent = codigo;

        overlay.classList.add("visivel");

        // Salva no histórico do banco
        const idUsuario = localStorage.getItem("idUsuario");
        if (idUsuario) {
            const descricao = itens.map(i => `${i.quantidade}x ${i.nome}`).join(", ");
            const endereco  = `${document.getElementById("inputRua")?.value}, ${document.getElementById("inputNumero")?.value}`;
            const subtotal = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

            fetch("/api/salvar-historico", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    id_usuario: idUsuario, 
                    codigo_pedido: codigo, 
                    descricao, 
                    endereco,
                    forma_pagamento:  document.querySelector(".abaPagamento.ativa")?.dataset.metodo || "pix",
                    valor: subtotal
                })
            });
        }

        setTimeout(() => animarEtapas(),    1500);
        setTimeout(() => dispararConfetti(), 800);
        setTimeout(() => burstParticulas(),  600);
    }

    const btnVoltarInicio = document.getElementById("btnVoltarInicio");
    if (btnVoltarInicio) {
        btnVoltarInicio.addEventListener("click", () => {
            window.location.href = "/";
        });
    }

    // ANIMAÇÃO ETAPAS ETA
    function animarEtapas() {
        const etapas = document.querySelectorAll(".etaItem");
        const linhas = document.querySelectorAll(".etaLinha");

        etapas.forEach((etapa, i) => {
            setTimeout(() => {
                etapa.classList.add("ativa");
                if (linhas[i]) linhas[i].classList.add("ativa");
            }, i * 600);
        });
    }

    // CONFETTI
    const cores = ["#ffd54f", "#4caf50", "#ff9800", "#00e676", "#ff5722", "#2196f3", "#e91e63"];

    function dispararConfetti() {
        for (let i = 0; i < 80; i++) {
            setTimeout(() => criarPiece(), i * 20);
        }
    }

    function criarPiece() {
        const el   = document.createElement("div");
        const cor  = cores[Math.floor(Math.random() * cores.length)];
        const left = Math.random() * 100;
        const dur  = (Math.random() * 2 + 2).toFixed(2);
        const size = Math.random() * 8 + 6;

        el.classList.add("confettiPiece");
        el.style.left         = left + "vw";
        el.style.background   = cor;
        el.style.width        = size + "px";
        el.style.height       = size + "px";
        el.style.setProperty("--dur", dur + "s");
        el.style.borderRadius = Math.random() > .5 ? "50%" : "2px";

        document.body.appendChild(el);
        setTimeout(() => el.remove(), parseFloat(dur) * 1000 + 200);
    }

    // BURST DE PARTÍCULAS NO CHECK
    function burstParticulas() {
        const container = document.getElementById("particlesBurst");
        if (!container) return;

        for (let i = 0; i < 16; i++) {
            const p      = document.createElement("div");
            const angulo = (i / 16) * 360;
            const dist   = 50 + Math.random() * 30;
            const dx     = Math.cos(angulo * Math.PI / 180) * dist;
            const dy     = Math.sin(angulo * Math.PI / 180) * dist;

            p.classList.add("particle");
            p.style.background = cores[Math.floor(Math.random() * cores.length)];
            p.style.transition = "transform .6s ease, opacity .6s ease";

            container.appendChild(p);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    p.style.transform = `translate(${dx}px, ${dy}px)`;
                    p.style.opacity   = "0";
                });
            });

            setTimeout(() => p.remove(), 700);
        }
    }

    // TOAST
    function mostrarToast(msg) {
        const existing = document.getElementById("toastFinalizar");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.id          = "toastFinalizar";
        toast.textContent = msg;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add("visivel"));
        });

        setTimeout(() => {
            toast.classList.remove("visivel");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // CHACOALHAR CAMPO INVÁLIDO
    function chacoalharCampo(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add("erro");
        el.focus();
        setTimeout(() => el.classList.remove("erro"), 1500);
    }

    // PARTÍCULAS DE FUNDO
    function iniciarParticulas() {
        const canvas = document.getElementById("efeitoParticulas");
        if (!canvas) return;

        const ctx        = canvas.getContext("2d");
        const particulas = [];

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        for (let i = 0; i < 60; i++) {
            particulas.push({
                x:     Math.random() * canvas.width,
                y:     Math.random() * canvas.height,
                vx:    (Math.random() - .5) * .4,
                vy:    (Math.random() - .5) * .4,
                r:     Math.random() * 2 + 1,
                alpha: Math.random() * .3 + .05
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

    // BOTÃO VOLTAR
    const botaoVoltar = document.getElementById("botaoVoltar");
    if (botaoVoltar) {
        botaoVoltar.addEventListener("click", () => {
            window.location.href = "/";
        });
    }

});