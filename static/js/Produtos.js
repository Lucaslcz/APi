document.addEventListener("DOMContentLoaded", () => {

    const cargo = localStorage.getItem("cargo");
    const botaoNovoProduto = document.getElementById("botaoNovoProduto");

    if (botaoNovoProduto && (cargo === "funcionario" || cargo === "chefe")) {
        botaoNovoProduto.classList.remove("escondido");
    }

    const overlay      = document.getElementById("overlayProduto");
    const modal        = document.getElementById("modalProduto");
    const form         = document.getElementById("formProduto");
    const mensagemErro = document.getElementById("mensagemErroProduto");

    function abrirModalProduto() {
        if (!overlay || !modal) return;
        overlay.classList.add("visivel");
        modal.classList.add("visivel");
        document.body.style.overflow = "hidden";
    }

    function fecharModalProduto() {
        if (!overlay || !modal) return;
        overlay.classList.remove("visivel");
        modal.classList.remove("visivel");
        document.body.style.overflow = "";
        form.reset();
        mensagemErro.classList.add("escondido");
    }

    botaoNovoProduto?.addEventListener("click", abrirModalProduto);
    document.getElementById("fecharModalProduto")?.addEventListener("click", fecharModalProduto);
    document.getElementById("btnCancelarProduto")?.addEventListener("click", fecharModalProduto);

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) fecharModalProduto();
    });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensagemErro.classList.add("escondido");

        const nome       = document.getElementById("inputNomeProduto").value.trim();
        const preco      = parseFloat(document.getElementById("inputPrecoProduto").value);
        const tempoMin   = parseInt(document.getElementById("inputTempoProduto").value, 10);
        const categoria  = document.getElementById("selectCategoriaProduto").value;
        const descricao  = document.getElementById("textareaDescricaoProduto").value.trim();
        const disponivel = document.getElementById("checkboxDisponivelProduto").checked;

        if (!nome || !preco || !tempoMin || !categoria) {
            mensagemErro.textContent = "Preencha todos os campos obrigatórios.";
            mensagemErro.classList.remove("escondido");
            return;
        }

        const btnSalvar = document.getElementById("btnSalvarProduto");
        btnSalvar.disabled = true;

        try {
            const resposta = await fetch("/api/cardapio/criar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    preco,
                    tempo_preparo: tempoMin * 60, // converte minutos -> segundos
                    categoria,
                    descricao,
                    disponivel
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok || resultado.erro) {
                throw new Error(resultado.erro || "Erro ao criar produto");
            }

            fecharModalProduto();

            // Recarrega o cardápio pra mostrar o novo item na hora
            if (typeof carregarCardapio === "function") {
                carregarCardapio();
            }

        } catch (erro) {
            mensagemErro.textContent = erro.message;
            mensagemErro.classList.remove("escondido");
        } finally {
            btnSalvar.disabled = false;
        }
    });

});