// MODAL DE REGISTRO DE CLIENTES

let todosUsuarios = [];

const idUsuarioLogado = localStorage.getItem('idUsuario');
const cargoUsuarioLogado = localStorage.getItem('cargo');
const ehChefeLogado = cargoUsuarioLogado === 'chefe';

async function abrirModalClientes() {
    const overlay = document.getElementById("overlayClientes");
    const modal   = document.getElementById("modalClientes");

    overlay.classList.add("visivel");
    modal.classList.add("visivel");
    document.body.style.overflow = "hidden";

    const thAcoes = document.getElementById("thAcoesClientes");
    if (thAcoes) thAcoes.classList.toggle("escondido", !ehChefeLogado);

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

        let colunaAcoes = "";

        if (ehChefeLogado) {
            const ehProprioUsuario = String(u.id) === String(idUsuarioLogado);

            if (ehProprioUsuario) {
                colunaAcoes = `<td><span style="color:#555; font-size:0.82rem;">—</span></td>`;
            } else {
                colunaAcoes = `
                    <td>
                        <select class="cargoSelect" data-id="${u.id}" data-cargo-atual="${u.cargo}">
                            <option value="cliente" ${u.cargo === "cliente" ? "selected" : ""}>Cliente</option>
                            <option value="funcionario" ${u.cargo === "funcionario" ? "selected" : ""}>Funcionário</option>
                            <option value="chefe" ${u.cargo === "chefe" ? "selected" : ""}>Chefe</option>
                        </select>
                    </td>
                `;
            }
        }

        tr.innerHTML = `
            <td><span class="idBadge">#${u.id}</span></td>
            <td class="nomeCliente">
                <div class="avatarCliente">${u.nome.charAt(0).toUpperCase()}</div>
                ${u.nome}
            </td>
            <td class="emailCliente">${u.email}</td>
            <td><span class="cargoBadge cargo-${u.cargo}">${labelCargo[u.cargo] || u.cargo}</span></td>
            <td>${dataFormatada}</td>
            ${colunaAcoes}
        `;

        corpo.appendChild(tr);
    });

    if (usuarios.length === 0) {
        const totalColunas = ehChefeLogado ? 6 : 5;
        corpo.innerHTML = `<tr><td colspan="${totalColunas}" style="text-align:center; color:#666; padding:30px;">Nenhum usuário encontrado.</td></tr>`;
    }

    if (ehChefeLogado) {
        document.querySelectorAll(".cargoSelect").forEach(select => {
            select.addEventListener("change", aoTrocarCargo);
        });
    }
}

// ── Popup de confirmação customizado (substitui o confirm() nativo) ──
function mostrarConfirmacaoCargo(nomeAlvo, novoCargo) {
    return new Promise((resolve) => {

        document.getElementById('popupConfirmCargoOverlay')?.remove();

        const labelCargo = { chefe: "Chefe", funcionario: "Funcionário", cliente: "Cliente" };

        const overlay = document.createElement('div');
        overlay.id = 'popupConfirmCargoOverlay';

        overlay.innerHTML = `
            <div id="popupConfirmCargoCaixa">
                <div id="popupConfirmCargoIcone">
                    <i class="fa-solid fa-user-pen"></i>
                </div>
                <h2 id="popupConfirmCargoTitulo">Alterar cargo</h2>
                <p id="popupConfirmCargoMensagem">
                    Tem certeza que deseja alterar o cargo de <strong>${nomeAlvo}</strong> para <strong>${labelCargo[novoCargo] || novoCargo}</strong>?
                </p>
                <div id="popupConfirmCargoBotoes">
                    <button id="botaoConfirmarCargo">Confirmar</button>
                    <button id="botaoCancelarCargo">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visivel'));

        function fechar(resultado) {
            overlay.classList.remove('visivel');
            setTimeout(() => overlay.remove(), 250);
            resolve(resultado);
        }

        document.getElementById('botaoConfirmarCargo').addEventListener('click', () => fechar(true));
        document.getElementById('botaoCancelarCargo').addEventListener('click', () => fechar(false));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar(false);
        });
    });
}

async function aoTrocarCargo(e) {
    const select      = e.target;
    const idAlvo       = select.dataset.id;
    const cargoAntigo  = select.dataset.cargoAtual;
    const novoCargo    = select.value;

    const usuarioAlvo = todosUsuarios.find(u => String(u.id) === String(idAlvo));
    const nomeAlvo = usuarioAlvo ? usuarioAlvo.nome : "este usuário";

    const confirmou = await mostrarConfirmacaoCargo(nomeAlvo, novoCargo);
    if (!confirmou) {
        select.value = cargoAntigo;
        return;
    }

    select.disabled = true;

    try {
        const resposta = await fetch("/api/cargo/alterar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_solicitante: idUsuarioLogado,
                id_alvo: idAlvo,
                cargo: novoCargo
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.erro || "Erro ao alterar cargo");
        }

        if (usuarioAlvo) usuarioAlvo.cargo = novoCargo;
        select.dataset.cargoAtual = novoCargo;
        atualizarStats(todosUsuarios);
        renderizarClientes(todosUsuarios);

    } catch (erro) {
        alert("Não foi possível alterar o cargo: " + erro.message);
        select.value = cargoAntigo;
        select.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("botaoRegistroClientes")?.addEventListener("click", abrirModalClientes);
    document.getElementById("fecharModalClientes")?.addEventListener("click", fecharModalClientes);
    document.getElementById("overlayClientes")?.addEventListener("click", fecharModalClientes);

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