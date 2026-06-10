// MODAL DE REGISTRO DE CLIENTES

let todosUsuarios = [];

async function abrirModalClientes() {
    const overlay = document.getElementById("overlayClientes");
    const modal   = document.getElementById("modalClientes");

    overlay.classList.add("visivel");
    modal.classList.add("visivel");
    document.body.style.overflow = "hidden";

    // Só carrega uma vez
    if (todosUsuarios.length === 0) {
        await carregarClientes();
    }
}

function fecharModalClientes() {
    document.getElementById("overlayClientes").classList.remove("visivel");
    document.getElementById("modalClientes").classList.remove("visivel");
    document.body.style.overflow = "";
}

async function carregarClientes() {
    try {
        const resposta = await fetch("/api/clientes");
        if (!resposta.ok) throw new Error();

        todosUsuarios = await resposta.json();

        document.getElementById("loadingClientes").classList.add("escondido");
        document.getElementById("tabelaClientes").classList.remove("escondido");

        atualizarStats(todosUsuarios);
        renderizarClientes(todosUsuarios);

    } catch {
        document.getElementById("loadingClientes").classList.add("escondido");
        document.getElementById("erroClientes").classList.remove("escondido");
    }
}

function atualizarStats(usuarios) {
    document.getElementById("numTotalClientes").textContent   = usuarios.length;
    document.getElementById("numChefes").textContent          = usuarios.filter(u => u.cargo === "chefe").length;
    document.getElementById("numFuncionarios").textContent    = usuarios.filter(u => u.cargo === "funcionario").length;
    document.getElementById("numClientes").textContent        = usuarios.filter(u => u.cargo === "cliente").length;
}

function renderizarClientes(usuarios) {
    const corpo = document.getElementById("corpoTabelaClientes");
    corpo.innerHTML = "";

    const labelCargo = { chefe: "Chefe", funcionario: "Funcionário", cliente: "Cliente" };

    usuarios.forEach(u => {
        const tr = document.createElement("tr");

        const data = new Date(u.criado_em.replace(" ", "T"));
        const dataFormatada = data.toLocaleDateString("pt-BR", {
            day: "2-digit", month: "short", year: "numeric"
        });

        tr.innerHTML = `
            <td><span class="idBadge">#${u.id}</span></td>
            <td class="nomeCliente">
                <div class="avatarCliente">${u.nome.charAt(0).toUpperCase()}</div>
                ${u.nome}
            </td>
            <td class="emailCliente">${u.email}</td>
            <td><span class="cargoBadge cargo-${u.cargo}">${labelCargo[u.cargo] || u.cargo}</span></td>
            <td>${dataFormatada}</td>
        `;

        corpo.appendChild(tr);
    });

    if (usuarios.length === 0) {
        corpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#666; padding:30px;">Nenhum usuário encontrado.</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // Abre o modal ao clicar no botão do menu
    document.getElementById("botaoRegistroClientes")?.addEventListener("click", abrirModalClientes);

    // Fecha pelo botão X
    document.getElementById("fecharModalClientes")?.addEventListener("click", fecharModalClientes);

    // Fecha clicando no overlay
    document.getElementById("overlayClientes")?.addEventListener("click", fecharModalClientes);

    // Filtro de busca
    document.getElementById("inputBuscaClientes")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const filtrados = todosUsuarios.filter(u =>
            u.nome.toLowerCase().includes(termo) ||
            u.email.toLowerCase().includes(termo) ||
            u.cargo.toLowerCase().includes(termo)
        );
        renderizarClientes(filtrados);
    });

});