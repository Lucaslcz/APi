import secrets
from datetime import datetime, timezone, timedelta
from main import app
from flask import render_template, request, redirect, jsonify
from database import banco_calabreso
from werkzeug.security import generate_password_hash, check_password_hash


# ────────────────────────────────────────────
# HELPER DE SESSÃO
# ────────────────────────────────────────────
def usuario_da_sessao():
    token = request.cookies.get('token_sessao')
    if not token:
        return None

    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.id, u.nome, u.email, c.cargo, s.expira_em
            FROM sessoes_login s
            JOIN usuarios u ON u.id = s.id_usuario
            JOIN cargos c   ON c.id_usuario = u.id
            WHERE s.token = %s
        """, (token,))
        sessao = cursor.fetchone()

        if not sessao:
            return None

        if sessao['expira_em'] < datetime.now():
            cursor.execute("DELETE FROM sessoes_login WHERE token = %s", (token,))
            conexao.commit()
            return None

        return sessao
    finally:
        cursor.close()
        conexao.close()


# ROTA PARA O FRONT CONSULTAR SE A SESSÃO AINDA É VÁLIDA
@app.route('/api/me')
def api_me():
    usuario = usuario_da_sessao()
    if not usuario:
        return jsonify({"logado": False}), 401

    return jsonify({
        "logado": True,
        "id":     usuario['id'],
        "nome":   usuario['nome'],
        "cargo":  usuario['cargo']
    })


# ROTA DE LOGOUT
@app.route('/logout', methods=['POST'])
def logout():
    token = request.cookies.get('token_sessao')

    if token:
        conexao = banco_calabreso()
        cursor = conexao.cursor()
        try:
            cursor.execute("DELETE FROM sessoes_login WHERE token = %s", (token,))
            conexao.commit()
        finally:
            cursor.close()
            conexao.close()

    resposta = jsonify({"ok": True})
    resposta.set_cookie('token_sessao', '', expires=0)
    return resposta


#ROTAS HTML
@app.route("/")
def HomePage():
    return render_template("HomePage.html")

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/cadastro')
def cadastrar():
    return render_template('cadastro.html')

@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/cardapio')
def cardapio():
    return render_template('cardapio.html')

@app.route('/promocoes')
def promocoes():
    return render_template('promocoes.html')

@app.route('/finalizar')
def finalizar():
    return render_template('finalizar.html')

@app.route('/historico')
def historico():
    return render_template('historico.html')

@app.route('/caixa')
def caixa():
    return render_template('caixa.html')

@app.route('/empresa')
def empresa():
    return render_template('empresa.html')




#ROTA DO BANCO PARA O CADASTRO
@app.route('/cadastrar', methods=['POST'])
def cadastro_usuario():
    nome = request.form.get('nome')
    email = request.form.get('email')
    senha = generate_password_hash(request.form.get('senha'))

    conexao = banco_calabreso()
    cursor = conexao.cursor()

    comando_sql = "INSERT INTO usuarios(nome, email, senha) VALUES (%s, %s, %s)"
    valores = (nome, email, senha)

    try:
        cursor.execute(
            "SELECT * FROM usuarios WHERE email = %s",
            (email,)
        )

        usuario_existente = cursor.fetchone()

        if usuario_existente:
            return "E-mail já cadastrado"

        cursor.execute(comando_sql, valores)
        conexao.commit()

        return redirect(f'/cadastro?sucesso=true&nome={nome}')

    except Exception as erro:
        return f"Houve um erro: {erro}"

    finally:
        cursor.close()
        conexao.close()





# ROTA DO BANCO PARA O LOGIN
@app.route('/logar', methods=['POST'])
def login_usuario():
    email   = request.form.get('email')
    senha   = request.form.get('senha')
    lembrar = request.form.get('lembrar') == 'on'

    conexao = banco_calabreso()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT u.id, u.nome, u.senha, c.cargo
            FROM usuarios u
            JOIN cargos c ON c.id_usuario = u.id
            WHERE u.email = %s
        """, (email,))
        usuario = cursor.fetchone()

        if not usuario:
            return redirect('/login?erro=usuario_nao_encontrado')

        id_banco, nome_banco, senha_banco, cargo_banco = usuario

        if not check_password_hash(senha_banco, senha):
            return redirect('/login?erro=senha_incorreta')

        # Gera o token de sessão e salva no banco
        token = secrets.token_hex(32)
        dias_validade = 30 if lembrar else 1
        expira_em = datetime.now() + timedelta(days=dias_validade)

        cursor_token = conexao.cursor()
        cursor_token.execute(
            "INSERT INTO sessoes_login (token, id_usuario, expira_em) VALUES (%s, %s, %s)",
            (token, id_banco, expira_em)
        )
        conexao.commit()
        cursor_token.close()

        resposta = redirect(f'/?logado=true&nome={nome_banco}&id={id_banco}&cargo={cargo_banco}')

        resposta.set_cookie(
            'token_sessao',
            token,
            httponly=True,
            samesite='Lax',
            secure=True,
            max_age=(dias_validade * 86400) if lembrar else None
        )
        return resposta

    except Exception as erro:
        return f"Houve um erro: {erro}"

    finally:
        cursor.close()
        conexao.close()





# ROTA PARA CONSULTAR CARGO
@app.route('/api/cargo/<int:id_usuario>')
def api_cargo(id_usuario):
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT cargo FROM cargos WHERE id_usuario = %s", (id_usuario,))
        resultado = cursor.fetchone()
        return jsonify(resultado)
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





# ROTA PARA ALTERAR CARGO
@app.route('/api/cargo/alterar', methods=['POST'])
def alterar_cargo():
    dados = request.get_json()
    id_solicitante = dados.get('id_solicitante')
    id_alvo        = dados.get('id_alvo')
    novo_cargo     = dados.get('cargo')

    if novo_cargo not in ('chefe', 'funcionario', 'cliente'):
        return jsonify({"erro": "Cargo inválido"}), 400

    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT cargo FROM cargos WHERE id_usuario = %s", (id_solicitante,))
        solicitante = cursor.fetchone()

        if not solicitante or solicitante['cargo'] != 'chefe':
            return jsonify({"erro": "Sem permissão"}), 403

        cursor.execute(
            "UPDATE cargos SET cargo = %s WHERE id_usuario = %s",
            (novo_cargo, id_alvo)
        )
        conexao.commit()
        return jsonify({"ok": True})

    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





# ROTA PARA ALTERAR A SENHA DO USUÁRIO LOGADO
@app.route('/api/senha/alterar', methods=['POST'])
def alterar_senha():
    usuario = usuario_da_sessao()
    if not usuario:
        return jsonify({"erro": "Você precisa estar logado."}), 401

    dados       = request.get_json() or {}
    senha_atual = dados.get('senha_atual', '')
    nova_senha  = dados.get('nova_senha', '')

    if not senha_atual or not nova_senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    if len(nova_senha) < 6:
        return jsonify({"erro": "A nova senha deve ter pelo menos 6 caracteres."}), 400

    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT senha FROM usuarios WHERE id = %s", (usuario['id'],))
        registro = cursor.fetchone()

        if not registro or not check_password_hash(registro['senha'], senha_atual):
            return jsonify({"erro": "Senha atual incorreta."}), 400

        nova_hash = generate_password_hash(nova_senha)

        cursor2 = conexao.cursor()
        cursor2.execute("UPDATE usuarios SET senha = %s WHERE id = %s", (nova_hash, usuario['id']))
        conexao.commit()
        cursor2.close()

        return jsonify({"ok": True})

    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





#ROTA DO BANCO PARA O CARDAPIO
@app.route('/api/cardapio')
def api_cardapio():
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM cardapio ORDER BY id")
        itens = cursor.fetchall()
        return jsonify(itens)

    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500

    finally:
        cursor.close()
        conexao.close()


# ROTA PARA CRIAR UM NOVO PRODUTO NO CARDÁPIO
# Só chefe e funcionário podem criar — validado pela sessão real (cookie), não pelo localStorage.
@app.route('/api/cardapio/criar', methods=['POST'])
def criar_produto():
    usuario = usuario_da_sessao()
    if not usuario or usuario['cargo'] not in ('chefe', 'funcionario'):
        return jsonify({"erro": "Sem permissão para criar produtos."}), 403

    dados = request.get_json() or {}

    nome          = (dados.get('nome') or '').strip()
    preco         = dados.get('preco')
    tempo_preparo = dados.get('tempo_preparo')  # já vem em segundos do front
    descricao     = (dados.get('descricao') or '').strip()
    categoria     = dados.get('categoria')
    disponivel    = 'Sim' if dados.get('disponivel', True) else 'Nao'

    categorias_validas = ('Hamburguer', 'Frango', 'Vegano', 'Bebida', 'Sobremesa', 'Combo')

    if not nome or not preco or not tempo_preparo or categoria not in categorias_validas:
        return jsonify({"erro": "Preencha nome, preço, tempo de preparo e uma categoria válida."}), 400

    try:
        preco = float(preco)
        tempo_preparo = int(tempo_preparo)
        if preco <= 0 or tempo_preparo <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"erro": "Preço ou tempo de preparo inválido."}), 400

    conexao = banco_calabreso()
    cursor = conexao.cursor()
    try:
        cursor.execute(
            """INSERT INTO cardapio (nome, preco, tempo_preparo, descricao, categoria, disponivel)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (nome, preco, tempo_preparo, descricao, categoria, disponivel)
        )
        conexao.commit()
        return jsonify({"ok": True, "id": cursor.lastrowid})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





#ROTA DO BANCO PARA O HISTORICO
@app.route('/api/historico/<int:id_usuario>')
def api_historico(id_usuario):
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM historico WHERE id_usuario = %s ORDER BY criado_em DESC",
            (id_usuario,)
        )
        pedidos = cursor.fetchall()

        brasilia = timezone(timedelta(hours=-3))
        for pedido in pedidos:
            if pedido.get('criado_em'):
                pedido['criado_em'] = pedido['criado_em'].astimezone(brasilia).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(pedidos)
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





# ROTA DA API DA CAIXA — todos os pedidos com nome do cliente
@app.route('/api/caixa')
def api_caixa():
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                h.id,
                h.codigo_pedido,
                h.descricao,
                h.endereco,
                h.forma_pagamento,
                h.valor,
                h.criado_em,
                u.nome AS nome_cliente
            FROM historico h
            JOIN usuarios u ON u.id = h.id_usuario
            ORDER BY h.criado_em DESC
        """)
        pedidos = cursor.fetchall()

        brasilia = timezone(timedelta(hours=-3))
        for pedido in pedidos:
            if pedido.get('criado_em'):
                pedido['criado_em'] = pedido['criado_em'].astimezone(brasilia).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(pedidos)
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()


# ROTA PARA O SALVAMENTO DO HISTORICO
@app.route('/api/salvar-historico', methods=['POST'])
def salvar_historico():
    dados = request.get_json()
    conexao = banco_calabreso()
    cursor = conexao.cursor()
    try:
        cursor.execute(
            """INSERT INTO historico 
               (id_usuario, codigo_pedido, descricao, endereco, forma_pagamento, valor) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (
                dados['id_usuario'],
                dados['codigo_pedido'],
                dados['descricao'],
                dados['endereco'],
                dados['forma_pagamento'],
                dados.get('valor', 0)
            )
        )
        conexao.commit()
        return jsonify({"ok": True})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





# ROTA PARA LISTAR TODOS OS USUÁRIOS
@app.route('/api/clientes')
def api_clientes():
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                u.id,
                u.nome,
                u.email,
                c.cargo,
                u.criado_em
            FROM usuarios u
            JOIN cargos c ON c.id_usuario = u.id
            ORDER BY c.cargo ASC, u.nome ASC
        """)
        usuarios = cursor.fetchall()

        brasilia = timezone(timedelta(hours=-3))
        for usuario in usuarios:
            if usuario.get('criado_em'):
                usuario['criado_em'] = usuario['criado_em'].astimezone(brasilia).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(usuarios)
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





# ROTA PARA CONSULTAR STATUS DO ESTABELECIMENTO
@app.route('/api/status')
def api_status():
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT valor FROM configuracoes WHERE chave = 'status_estabelecimento'")
        resultado = cursor.fetchone()
        return jsonify(resultado)
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()


# ROTA PARA ALTERAR STATUS DO ESTABELECIMENTO
@app.route('/api/status/alterar', methods=['POST'])
def api_status_alterar():
    dados  = request.get_json()
    valor  = dados.get('valor')

    if valor not in ('aberto', 'fechado'):
        return jsonify({"erro": "Valor inválido"}), 400

    conexao = banco_calabreso()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            "UPDATE configuracoes SET valor = %s WHERE chave = 'status_estabelecimento'",
            (valor,)
        )
        conexao.commit()
        return jsonify({"ok": True})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





#ROTA PARA OS DADOS DA EMPRESA
@app.route('/api/empresa')
def api_empresa():
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT nome, cnpj, telefone, endereco, horario FROM empresa WHERE id = 1")
        resultado = cursor.fetchone()
        return jsonify(resultado or {})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()


# Salva os dados editados da empresa
# Só o chefe pode salvar — funcionário acessa a página, mas não tem permissão de editar.
@app.route('/api/empresa/salvar', methods=['POST'])
def api_empresa_salvar():
    usuario = usuario_da_sessao()
    if not usuario or usuario['cargo'] != 'chefe':
        return jsonify({"erro": "Sem permissão."}), 403

    dados = request.get_json()
    conexao = banco_calabreso()
    cursor = conexao.cursor()
    try:
        cursor.execute("""
            UPDATE empresa
            SET nome = %s, cnpj = %s, telefone = %s, endereco = %s, horario = %s
            WHERE id = 1
        """, (
            dados.get('nome', ''),
            dados.get('cnpj', ''),
            dados.get('telefone', ''),
            dados.get('endereco', ''),
            dados.get('horario', '')
        ))
        conexao.commit()
        return jsonify({"ok": True})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





#ROTA PARA OS AVISOS
@app.route('/api/avisos')
def api_avisos():
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, texto, criado_em FROM avisos ORDER BY criado_em DESC")
        avisos = cursor.fetchall()

        brasilia = timezone(timedelta(hours=-3))
        for aviso in avisos:
            if aviso.get('criado_em'):
                aviso['criado_em'] = aviso['criado_em'].astimezone(brasilia).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(avisos)
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()


# Cria um novo aviso — só o chefe pode publicar
@app.route('/api/avisos/criar', methods=['POST'])
def api_avisos_criar():
    usuario = usuario_da_sessao()
    if not usuario or usuario['cargo'] != 'chefe':
        return jsonify({"erro": "Sem permissão."}), 403

    dados = request.get_json()
    texto = dados.get('texto', '').strip()

    if not texto:
        return jsonify({"erro": "Texto vazio"}), 400

    conexao = banco_calabreso()
    cursor = conexao.cursor()
    try:
        cursor.execute("INSERT INTO avisos (texto) VALUES (%s)", (texto,))
        conexao.commit()
        return jsonify({"ok": True})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()


# Deleta um aviso pelo id — só o chefe pode remover
@app.route('/api/avisos/deletar/<int:id_aviso>', methods=['DELETE'])
def api_avisos_deletar(id_aviso):
    usuario = usuario_da_sessao()
    if not usuario or usuario['cargo'] != 'chefe':
        return jsonify({"erro": "Sem permissão."}), 403

    conexao = banco_calabreso()
    cursor = conexao.cursor()
    try:
        cursor.execute("DELETE FROM avisos WHERE id = %s", (id_aviso,))
        conexao.commit()
        return jsonify({"ok": True})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()





# ROTA PARA BUSCAR ENDEREÇO SALVO DO USUÁRIO
@app.route('/api/endereco/<int:id_usuario>')
def api_endereco(id_usuario):
    conexao = banco_calabreso()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT endereco_salvo FROM usuarios WHERE id = %s", (id_usuario,))
        resultado = cursor.fetchone()
        return jsonify(resultado or {})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()


# ROTA PARA SALVAR ENDEREÇO DO USUÁRIO
@app.route('/api/endereco/salvar', methods=['POST'])
def api_endereco_salvar():
    dados      = request.get_json()
    id_usuario = dados.get('id_usuario')
    endereco   = dados.get('endereco')

    if not id_usuario or not endereco:
        return jsonify({"erro": "Dados inválidos"}), 400

    import json
    conexao = banco_calabreso()
    cursor = conexao.cursor()
    try:
        cursor.execute(
            "UPDATE usuarios SET endereco_salvo = %s WHERE id = %s",
            (json.dumps(endereco, ensure_ascii=False), id_usuario)
        )
        conexao.commit()
        return jsonify({"ok": True})
    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500
    finally:
        cursor.close()
        conexao.close()