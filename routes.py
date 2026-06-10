from main import app
from flask import render_template, request, redirect, jsonify
from database import banco_calabreso
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timezone, timedelta


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
    email = request.form.get('email')
    senha = request.form.get('senha')

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

        return redirect(f'/?logado=true&nome={nome_banco}&id={id_banco}&cargo={cargo_banco}')

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

    if novo_cargo not in ('funcionario', 'cliente'):
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
@app.route('/api/empresa/salvar', methods=['POST'])
def api_empresa_salvar():
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

# Cria um novo aviso
@app.route('/api/avisos/criar', methods=['POST'])
def api_avisos_criar():
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

# Deleta um aviso pelo id
@app.route('/api/avisos/deletar/<int:id_aviso>', methods=['DELETE'])
def api_avisos_deletar(id_aviso):
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