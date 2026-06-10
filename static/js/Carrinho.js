// CARRINHO - Hamburgueria Calabreso
const botaoCarrinho   = document.getElementById("botaoCarrinho");
const painelCarrinho  = document.getElementById("painelCarrinho");
const fecharCarrinho  = document.getElementById("fecharCarrinho");
const overlayCarrinho = document.getElementById("overlayCarrinho");
const conteudoCarrinho = document.getElementById("conteudoCarrinho");
const mensagemVazio   = document.getElementById("mensagemCarrinhoVazio");
const valorTotal      = document.getElementById("valorTotal");

// ── CARREGA DO localStorage (persiste entre páginas) ──
let itensCarrinho = JSON.parse(localStorage.getItem("carrinhoCalabreso") || "[]");

// ── SALVA NO localStorage ──
function salvarCarrinho() {
    localStorage.setItem("carrinhoCalabreso", JSON.stringify(itensCarrinho));
}

// ABRE E FECHA
function abrirCarrinho() {
    painelCarrinho.classList.add("aberto");
    overlayCarrinho.classList.add("ativo");
}

function fecharPainelCarrinho() {
    painelCarrinho.classList.remove("aberto");
    overlayCarrinho.classList.remove("ativo");
}

botaoCarrinho.addEventListener("click", abrirCarrinho);
fecharCarrinho.addEventListener("click", fecharPainelCarrinho);
overlayCarrinho.addEventListener("click", fecharPainelCarrinho);


// ADICIONA ITEM (chamado pelo Cardapio.js)
function adicionarAoCarrinho(item) {
    const existente = itensCarrinho.find(i => i.id === item.id);

    if (existente) {
        existente.quantidade++;
    } else {
        itensCarrinho.push({ ...item, quantidade: 1 });
    }

    salvarCarrinho();
    renderizarCarrinho();
    abrirCarrinho();
}


// REMOVE ITEM
function removerDoCarrinho(id) {
    itensCarrinho = itensCarrinho.filter(i => i.id !== id);
    salvarCarrinho();
    renderizarCarrinho();
}


// ALTERA QUANTIDADE
function alterarQuantidade(id, delta) {
    const item = itensCarrinho.find(i => i.id === id);
    if (!item) return;

    item.quantidade += delta;

    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
    } else {
        salvarCarrinho();
        renderizarCarrinho();
    }
}


// FORMATA PREÇO
function formatarPrecoCarrinho(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


// RENDERIZA OS ITENS NO PAINEL
function renderizarCarrinho() {
    conteudoCarrinho.querySelectorAll('.itemCarrinho').forEach(el => el.remove());

    if (itensCarrinho.length === 0) {
        mensagemVazio.classList.remove('escondido');
        valorTotal.textContent = 'R$ 0,00';
        return;
    }

    mensagemVazio.classList.add('escondido');

    const fragmento = document.createDocumentFragment();

    itensCarrinho.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('itemCarrinho');
        div.dataset.id = item.id;

        const nome = document.createElement('span');
        nome.classList.add('itemCarrinho-nome');
        nome.textContent = item.nome;

        const controles = document.createElement('div');
        controles.classList.add('itemCarrinho-controles');

        const btnMenos = document.createElement('button');
        btnMenos.classList.add('btnQuantidade');
        btnMenos.textContent = '−';
        btnMenos.addEventListener('click', () => alterarQuantidade(item.id, -1));

        const quantidade = document.createElement('span');
        quantidade.classList.add('itemCarrinho-quantidade');
        quantidade.textContent = item.quantidade;

        const btnMais = document.createElement('button');
        btnMais.classList.add('btnQuantidade');
        btnMais.textContent = '+';
        btnMais.addEventListener('click', () => alterarQuantidade(item.id, 1));

        const preco = document.createElement('span');
        preco.classList.add('itemCarrinho-preco');
        preco.textContent = formatarPrecoCarrinho(item.preco * item.quantidade);

        const btnRemover = document.createElement('button');
        btnRemover.classList.add('btnRemover');
        btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btnRemover.addEventListener('click', () => removerDoCarrinho(item.id));

        controles.appendChild(btnMenos);
        controles.appendChild(quantidade);
        controles.appendChild(btnMais);

        div.appendChild(nome);
        div.appendChild(controles);
        div.appendChild(preco);
        div.appendChild(btnRemover);

        fragmento.appendChild(div);
    });

    conteudoCarrinho.appendChild(fragmento);

    const total = itensCarrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    valorTotal.textContent = formatarPrecoCarrinho(total);
}

// Renderiza ao carregar a página (caso já tenha itens salvos)
renderizarCarrinho();