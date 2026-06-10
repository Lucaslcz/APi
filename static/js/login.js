// Efeito de particulas aleatorias no background
document.addEventListener("DOMContentLoaded", () => {
    const efeitoParticulas = document.getElementById("efeitoParticulas");

    for(let indice = 0; indice < 40; indice++){
        const particula = document.createElement("div");
        particula.classList.add("particulaHamburgueria");

        let tamanho = Math.random() * 8 + 4;

        particula.style.width = tamanho + "px";
        particula.style.height = tamanho + "px";
        particula.style.left = Math.random() * window.innerWidth + "px";
        particula.style.top = Math.random() * window.innerHeight + "px";

        particula.style.background = Math.random() > 0.5 ? "#FFD54F" : "#4CAF50";
        particula.style.opacity = "0.4";

        efeitoParticulas.appendChild(particula);

        animarParticula(particula);
    }

    function animarParticula(particula){
        let posicaoY = parseFloat(particula.style.top);

        setInterval(() => {
            posicaoY -= 1;

            if(posicaoY < -20){
                posicaoY = window.innerHeight;
            }

            particula.style.top = posicaoY + "px";
        }, 30);
    }

    const camposFormulario = document.querySelectorAll("input");

    camposFormulario.forEach(campo => {
        campo.addEventListener("focus", () => {
            campo.style.transform = "scale(1.03)";
        });

        campo.addEventListener("blur", () => {
            campo.style.transform = "scale(1)";
        });
    });

    const logoHamburgueria = document.getElementById("logoHamburgueria");

    if(logoHamburgueria){
        setInterval(() => {
            logoHamburgueria.animate(
                [
                    { transform: "translateY(0px)" },
                    { transform: "translateY(-10px)" },
                    { transform: "translateY(0px)" }
                ],
                {
                    duration: 2000
                }
            );
        }, 2000);
    }





// Sistema para a ação de visualizar a senha e esconder a senha "login"
const campoSenha = document.getElementById("senhaCliente");
const visualizarSenha = document.getElementById("visualizarSenha");

    if(campoSenha && visualizarSenha){
        visualizarSenha.addEventListener("click", () => {

            if(campoSenha.type === "password"){
                campoSenha.type = "text";
                visualizarSenha.textContent = "🐵";
            }else{
                campoSenha.type = "password";
                visualizarSenha.textContent = "🙈";
            }
        });
    }
});





//