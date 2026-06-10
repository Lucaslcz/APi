// CARDÁPIO - Hamburgueria Calabreso
let todosItens = [];
let categoriaAtiva = 'todos';

function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return minutos + ' min';
    const horas = Math.floor(minutos / 60);
    const min   = minutos % 60;
    return min > 0 ? horas + 'h ' + min + 'min' : horas + 'h';
}

// Formata valor em reais
function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Mostra apenas um dos estados da grade (loading, erro, semResultados ou nenhum)
function mostrarEstado(estado) {
    document.getElementById('loadingCardapio').classList.add('escondido');
    document.getElementById('semResultados').classList.add('escondido');
    document.getElementById('erroCardapio').classList.add('escondido');

    if (estado) {
        document.getElementById(estado).classList.remove('escondido');
    }
}

// Cria um card clonando o <template> do HTML e preenchendo os dados
function criarCard(item, delay) {
    const template = document.getElementById('templateCard');
    const clone    = template.content.cloneNode(true);
    const card     = clone.querySelector('.cardItem');
    const disponivel = item.disponivel === 'Sim';

    card.style.animationDelay = delay + 'ms';

    if (!disponivel) {
        card.classList.add('indisponivel');
    }

    // Badge de categoria
    const badge = card.querySelector('.cardItem-badge');
    badge.textContent = item.categoria;
    badge.classList.add('badge-' + item.categoria);

    // Textos
    card.querySelector('.cardItem-nome').textContent       = item.nome;
    card.querySelector('.cardItem-descricao').textContent  = item.descricao || 'Sem descrição disponível.';
    card.querySelector('.cardItem-preco').textContent      = formatarPreco(item.preco);
    card.querySelector('.cardItem-tempoTexto').textContent = formatarTempo(item.tempo_preparo);

    // Tag de indisponível
    if (!disponivel) {
        card.querySelector('.tag-indisponivel').classList.remove('escondido');
    }

    // Botão adicionar
    const btnAdicionar = card.querySelector('.btnAdicionar');

    if (!disponivel) {
        btnAdicionar.remove();
    } else {
        btnAdicionar.dataset.id    = item.id;
        btnAdicionar.dataset.nome  = item.nome;
        btnAdicionar.dataset.preco = item.preco;
        btnAdicionar.dataset.tempoPreparo = item.tempo_preparo || 600;
        btnAdicionar.addEventListener('click', onClickAdicionar);
    }

    return clone;
}

// Clique no botão de adicionar ao carrinho
function onClickAdicionar(e) {
    const btn   = e.currentTarget;
    const icone = btn.querySelector('i');

    adicionarAoCarrinho({
        id:    btn.dataset.id,
        nome:  btn.dataset.nome,
        preco: parseFloat(btn.dataset.preco),
        tempo_preparo: parseFloat(btn.dataset.tempoPreparo) || 600
    });

    // Feedback visual
    icone.className = 'fa-solid fa-check';
    btn.classList.add('adicionado');

    setTimeout(() => {
        icone.className = 'fa-solid fa-plus';
        btn.classList.remove('adicionado');
    }, 800);
}

// Renderia os itens
function renderizarItens(itens) {
    const grade = document.getElementById('gradeCardapio');

    grade.querySelectorAll('.secaoCategoria').forEach(s => s.remove());

    if (itens.length === 0) {
        mostrarEstado('semResultados');
        return;
    }

    mostrarEstado(null);

    // Agrupa itens por categoria
    const grupos = {};
    itens.forEach(item => {
        if (!grupos[item.categoria]) grupos[item.categoria] = [];
        grupos[item.categoria].push(item);
    });

    // Renderiza cada grupo na ordem definida
    const ordemFinal = categoriaAtiva === 'todos'
        ? ORDEM_CATEGORIAS
        : [categoriaAtiva];

    const fragmento = document.createDocumentFragment();
    let delay = 0;

    ordemFinal.forEach(cat => {
        if (!grupos[cat]) return;

        const secao  = document.createElement('div');
        secao.classList.add('secaoCategoria');

        const titulo = document.createElement('h2');
        titulo.classList.add('tituloCategoria');
        titulo.textContent = NOMES_CATEGORIAS[cat] || cat;
        secao.appendChild(titulo);

        const lista = document.createElement('div');
        lista.classList.add('listaCategoria');

        grupos[cat].forEach(item => {
            lista.appendChild(criarCard(item, delay));
            delay += 30;
        });

        secao.appendChild(lista);
        fragmento.appendChild(secao);
    });

    grade.appendChild(fragmento);
}

// Filtra por categoria e re-renderiza
function filtrarPorCategoria(categoria) {
    categoriaAtiva = categoria;

    const filtrados = categoria === 'todos'
        ? todosItens
        : todosItens.filter(item => item.categoria === categoria);

    renderizarItens(filtrados);
}

// Busca o cardápio na API do Flask
async function carregarCardapio() {
    try {
        const resposta = await fetch('/api/cardapio');
        if (!resposta.ok) throw new Error('Erro na resposta da API');

        todosItens = await resposta.json();
        filtrarPorCategoria(categoriaAtiva);

    } catch (erro) {
        console.error('Erro ao carregar cardápio:', erro);
        mostrarEstado('erroCardapio');
    }
}

// Inicializa os botões de filtro
function inicializarFiltros() {
    const botoes = document.querySelectorAll('.btnFiltro');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            filtrarPorCategoria(btn.dataset.categoria);
        });
    });
}

// Efeito de luz no rodapé
function inicializarEfeitoRodape() {
    const rodape = document.getElementById('rodapePrincipal');
    const luz    = document.querySelector('.efeito-luz');

    if (rodape && luz) {
        rodape.addEventListener('mousemove', (e) => {
            luz.style.left = (e.clientX - rodape.offsetLeft) + 'px';
        });
    }
}


// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    inicializarFiltros();
    inicializarEfeitoRodape();
    carregarCardapio();
});

const ORDEM_CATEGORIAS = ['Hamburguer', 'Frango', 'Vegano', 'Combo', 'Bebida', 'Sobremesa'];

const NOMES_CATEGORIAS = {
    Hamburguer: '🍔 Hambúrgueres',
    Frango:     '🍗 Frango',
    Vegano:     '🌱 Vegano',
    Combo:      '📦 Combos',
    Bebida:     '🥤 Bebidas',
    Sobremesa:  '🍨 Sobremesas'
};