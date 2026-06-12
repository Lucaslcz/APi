<div align="center">

# 🍔 Hamburgueria Calabreso

### Sistema Web Full Stack para gerenciamento de pedidos, clientes e operações internas de uma hamburgueria.

<br>

<img width="1907" height="947" alt="image" src="https://github.com/user-attachments/assets/37f24007-a5ca-4779-9d07-9bc2c92a2981" />


</div>

---

# 📖 Sobre o Projeto

A **Hamburgueria Calabreso** é um sistema web desenvolvido para automatizar o gerenciamento de pedidos, clientes e operações administrativas de uma hamburgueria.

A aplicação foi construída utilizando **Python + Flask** no back-end, **MySQL** para persistência dos dados e **HTML, CSS e JavaScript** para a interface do usuário.

O sistema possui diferentes níveis de acesso para clientes, funcionários e administradores, garantindo que cada usuário tenha acesso apenas às funcionalidades necessárias.

---

# ⚙️ Funcionalidades

### 🔐 Autenticação

* Cadastro de usuários
* Login seguro
* Senhas criptografadas
* Controle de permissões

### 🍔 Cardápio

* Consulta dinâmica de produtos
* Integração com banco de dados

### 🎁 Promoções

* Exibição de promoções especiais
* Atualização dinâmica via JavaScript

### 🛒 Pedidos

* Finalização de compras
* Registro automático de pedidos
* Armazenamento no banco de dados

### 📜 Histórico

* Histórico individual de compras
* Consulta por usuário
* Organização por data

### 💰 Caixa Registradora

* Visualização dos pedidos realizados
* Controle operacional

### 🏢 Empresa

* Gerenciamento de:

  * Nome
  * CNPJ
  * Telefone
  * Endereço
  * Horário de funcionamento

### 📢 Avisos

* Criação de avisos
* Exclusão de avisos
* Listagem de comunicados

### ⚙️ Administração

* Alteração de cargos
* Controle de acesso
* Abertura e fechamento do estabelecimento

---

# 🚀 Tecnologias Utilizadas

### Back-end

* Python
* Flask
* Werkzeug Security

### Front-end

* HTML5
* CSS3
* JavaScript

### Banco de Dados

* MySQL

### Ferramentas

* Git
* GitHub
* VS Code

---

# 👥 Controle de Acesso

## Cliente

* Cardápio
* Promoções
* Finalizar Compra
* Histórico

## Funcionário

Possui acesso a todas as funções do Cliente e também:

* Caixa Registradora
* Status do Estabelecimento

## Chefe

Possui acesso a todas as funções do Funcionário e também:

* Registro de Usuários
* Gerenciamento da Empresa
* Alteração de Cargos

---

# 📂 Estrutura do Projeto

```bash
hamburgueria-calabreso/
│
├── estatico/
│
├── modelos/
│
├── database.py
│
├── main.py
│
├── rotas.py
│
├── requisitos.txt
│
└── .gitignore
```

---

# ⚙️ Como Executar

### Clonar o repositório

```bash
git clone https://github.com/seu-usuario/hamburgueria-calabreso.git
```

### Entrar na pasta

```bash
cd hamburgueria-calabreso
```

### Criar ambiente virtual

```bash
python -m venv venv
```

### Ativar ambiente virtual

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

### Instalar dependências

```bash
pip install -r requisitos.txt
```

### Executar aplicação

```bash
python main.py
```

---

# 👨‍💻 Desenvolvedor - Lucas Da Cruz


Projeto desenvolvido para aplicação prática de conceitos de desenvolvimento Full Stack utilizando Python, Flask, MySQL, HTML, CSS e JavaScript.

---

<div align="center">

### 🍔 Hamburgueria Calabreso

[Acesse e descubra mais.](https://hamburgueria-calabreso.up.railway.app/)

</div>
