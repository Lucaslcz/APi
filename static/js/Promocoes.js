// Lista de promoções — baseadas nos itens do cardápio
let promocoes = [];

async function carregarPromocoes() {
    try {
        const resposta = await fetch('/static/data/promocoes.json');

        if (!resposta.ok) throw new Error('Status ' + resposta.status);

        promocoes = await resposta.json();
        renderizarPromocoes('todos');

    } catch (erro) {
        console.error('Erro ao carregar promoções:', erro);
    }
}
let filtroAtivo = 'todos';


// Mapeia o tipo da promoção para a classe CSS da tag
function classeTag(tipo) {
    const mapa = {
        desconto: 'tag-desconto',
        frete:    'tag-frete',
        leve2:    'tag-leve2',
        combo:    'tag-combo'
    };
    return mapa[tipo] || 'tag-desconto';
}


// Formata valor para o padrão brasileiro
function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


// Cria um card de promoção clonando o <template> do HTML
function criarCardPromo(promo, delay) {
    const template = document.getElementById('templateCardPromo');
    const clone    = template.content.cloneNode(true);
    const card     = clone.querySelector('.cardPromo');

    card.style.animationDelay = delay + 'ms';
    card.dataset.tipo = promo.tipo;

    // Tag de promoção
    const tag = card.querySelector('.cardPromo-tag');
    tag.textContent = promo.tag;
    tag.classList.add(classeTag(promo.tipo));

    // Ícone decorativo
    card.querySelector('.cardPromo-icone').classList.add(...promo.icone.split(' '));

    // Textos
    card.querySelector('.cardPromo-nome').textContent        = promo.nome;
    card.querySelector('.cardPromo-descricao').textContent   = promo.descricao;
    card.querySelector('.cardPromo-precoAntigo').textContent = formatarPreco(promo.precoAntigo);
    card.querySelector('.cardPromo-precoAtual').textContent  = formatarPreco(promo.precoAtual);

    // Botão adicionar ao carrinho
    const btn = card.querySelector('.btnAdicionarPromo');
    btn.dataset.id    = promo.id;
    btn.dataset.nome  = promo.nome;
    btn.dataset.preco = promo.precoAtual;
    btn.addEventListener('click', onClickAdicionarPromo);

    return clone;
}


// Clique no botão de adicionar ao carrinho
function onClickAdicionarPromo(e) {
    const btn   = e.currentTarget;
    const icone = btn.querySelector('i');

    adicionarAoCarrinho({
        id:    btn.dataset.id,
        nome:  btn.dataset.nome,
        preco: parseFloat(btn.dataset.preco)
    });

    // Feedback visual temporário no botão
    icone.className = 'fa-solid fa-check';
    btn.classList.add('adicionado');

    setTimeout(() => {
        icone.className = 'fa-solid fa-cart-plus';
        btn.classList.remove('adicionado');
    }, 800);
}


// Renderiza os cards na grade conforme o filtro ativo
function renderizarPromocoes(filtro) {
    const grade = document.getElementById('gradePromocoes');

    grade.querySelectorAll('.cardPromo').forEach(c => c.remove());

    const filtradas = filtro === 'todos'
        ? promocoes
        : promocoes.filter(p => p.tipo === filtro);

    const fragmento = document.createDocumentFragment();

    filtradas.forEach((promo, index) => {
        fragmento.appendChild(criarCardPromo(promo, index * 60));
    });

    grade.appendChild(fragmento);
}


// Inicializa os botões de filtro
function inicializarFiltros() {
    const botoes = document.querySelectorAll('.btnFiltroPromo');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');

            filtroAtivo = btn.dataset.filtro;
            renderizarPromocoes(filtroAtivo);
        });
    });
}


// Animação dos contadores numéricos ao carregar a página
function animarContadores() {
    const contadores = document.querySelectorAll('.contadorNumero');

    contadores.forEach(contador => {
        const alvo       = parseInt(contador.dataset.alvo);
        const duracao    = 1500;
        const intervalo  = 30;
        const passos     = duracao / intervalo;
        const incremento = alvo / passos;
        let atual = 0;

        const timer = setInterval(() => {
            atual += incremento;

            if (atual >= alvo) {
                contador.textContent = alvo;
                clearInterval(timer);
            } else {
                contador.textContent = Math.floor(atual);
            }
        }, intervalo);
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
    animarContadores();
    carregarPromocoes();
});