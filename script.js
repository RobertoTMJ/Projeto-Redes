//Escutador que garante que o DOM esteja totalmente renderizado
document.addEventListener("DOMContentLoaded", function() {
    //Variáveis
    let formulario = document.querySelector("#formulario");
    let resultadosContainer = document.querySelector("#resultados");

    formulario.addEventListener("submit", function(event){
        event.preventDefault();

        let enderecoIP = formulario.querySelector("#endereco-ip").value;
        let mascaraBloco = formulario.querySelector("#mascara").value;
        let quantidadeSubRedes = parseInt(formulario.querySelector("#quantidade-subredes").value);

        try {
            /**
             * Chama a função para zerar o último octeto do endereço IP.
             * Obtém o endereço IP modificado sem o último octeto,pronto para os outros calculos.
             */
            let enderecoZerado = zerarUltimoOcteto(enderecoIP);
            /**
             * Calcula as sub-redes com base nos parâmetros fornecidos.
             * Usa o endereço IP zerado, a máscara de sub-rede e a quantidade de sub-redes desejadas para calcular as informações das sub-redes.
             */
            let tabelaResultados = calcularSubredes(enderecoZerado, mascaraBloco, quantidadeSubRedes);
            // esconde o formulário e prepara o container para os resultados
            formulario.style.display = "none";
            resultadosContainer.innerHTML = '<button id="voltar">Voltar</button>';

            // Criação da tabela
            let tabela = document.createElement("table");
            tabela.classList.add("resultado-table");

            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");

            // Cabeçalho da tabela
            let cabecalho = `
                <tr>
                    <th>Subrede</th>
                    <th>Qtd. de estações</th>
                    <th>Endereços da sub-rede</th>
                    <th>Primeiro endereço</th>
                    <th>Broadcast</th>
                    <th>Máscara</th>
                </tr>
            `;
            thead.innerHTML = cabecalho;
            /**
             * Preenche as linhas da tabela com os resultados calculados.
             * cria dinamicamente as linhas da tabela com as informações calculadas para cada sub-rede.
             */

            tabelaResultados.forEach((subrede, index) => {
                let linha = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${subrede.qtdEstacoes}</td>
                        <td>${subrede.enderecosSubRede}</td>
                        <td>${subrede.primeiroEndereco}</td>
                        <td>${subrede.broadcast}</td>
                        <td>${subrede.mascara}</td>
                    </tr>
                `;
                tbody.innerHTML += linha;
            });
            // Adiciona cabeçalho e corpo da tabela ao elemento da tabela
            tabela.appendChild(thead);
            tabela.appendChild(tbody);

             // Adiciona a tabela ao container de resultados
            resultadosContainer.appendChild(tabela);
            resultadosContainer.style.display = "block";

        } catch (error) {
            console.error(error.message); // Exibe qualquer erro no console do navegador
        }
    });


    // Adiciona o evento de clique no botão "Voltar"
    resultadosContainer.addEventListener("click", function(event) {
        if (event.target.id === "voltar") {
            resultadosContainer.style.display = "none";
            formulario.style.display = "block";
        }
    });
});

/**
 * Função para zerar o último octeto de um endereço IP.
 * Recebe um endereço IP no formato "xxx.xxx.xxx.xxx" e retorna o mesmo endereço com o último octeto substituído por um 0
 * @param {string} enderecoIP - Endereço IP no formato "xxx.xxx.xxx.xxx"
 * @returns {string} Endereço IP com o último octeto substituído por 0
 */

function zerarUltimoOcteto(enderecoIP) {
    let octetos = enderecoIP.split('.');
    
    if (octetos.length !== 4) {
       console.error('Endereço IP inválido.');
    }

    octetos[3] = '0';

    return octetos.join('.');
}

/**
 * Função para converter um endereço IP para formato binário
 * Recebe um endereço IP no formato "xxx.xxx.xxx.xxx" e retorna o mesmo endereço no formato binário.
 * @param {string} enderecoIP - Endereço IP no formato "xxx.xxx.xxx.xxx".
 * @returns {string} Endereço IP convertido para formato binário.
 */

function converteParaBinario(enderecoIP) {
    return enderecoIP.split('.')
        .map(octeto => {
            let binario = parseInt(octeto, 10).toString(2);
            return binario.padStart(8, '0');
        })
        .join('.');
}

/**
 * Função para converter uma máscara de sub-rede para formato binário.
 * Recebe uma máscara de sub-rede no formato "/yy" e retorna a máscara no formato binário.
 * @param {string} mascara - Máscara de sub-rede no formato "/yy".
 * @returns {string} Máscara de sub-rede convertida para formato binário.
 * @throws {Error} Se a máscara de sub-rede fornecida não for válida.
 */

function mascaraSubredeParaBinario(mascara) {
    if (!eMascaraSubredeValida(mascara)) {
       console.error('Máscara de sub-rede inválida.');
    }

    let prefixo = parseInt(mascara.split('/')[1]);
    let binario = '1'.repeat(prefixo).padEnd(32, '0');

    return `${parseInt(binario.slice(0,8), 2)}.${parseInt(binario.slice(8,16), 2)}.${parseInt(binario.slice(16,24), 2)}.${parseInt(binario.slice(24,32), 2)}`;
}

/**
 * Função para verificar se uma máscara de sub-rede é válida
 * Recebe uma string que representa a máscara de sub-rede e verifica se é válida.
 * @param {string} mascara - Máscara de sub-rede para validar.
 * @returns {boolean} true se a máscara de sub-rede é válida, caso contrário false.
 */
function eMascaraSubredeValida(mascara) {
    let regexMascara = /^\/([0-9]|[1-2][0-9]|3[0-2])$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regexMascara.test(mascara);
}

/**
 * Função para contar zeros em uma máscara de sub-rede binária
 * Recebe uma máscara de sub-rede no formato binário e conta o número de bits zero.
 * @param {string} mascaraBinaria - Máscara de sub-rede no formato binário.
 * @returns {number} Quantidade de zeros na máscara de sub-rede.
 */
function contarZerosNaMascara(mascaraBinaria) {
    let octetos = mascaraBinaria.split('.').map(octeto => parseInt(octeto, 10));
    let zeros = octetos.reduce((totalZeros, octeto) => {
        return totalZeros + (8 - octeto.toString(2).replace(/0/g, '').length);
    }, 0);

    return zeros;
}

/**
 * Função para calcular a quantidade de endereços disponíveis baseado na quantidade de zeros na máscara
 * Recebe a quantidade de zeros na máscara de sub-rede e calcula a quantidade de endereços de host disponíveis.
 * @param {number} quantidadeZeros - Quantidade de zeros na máscara de sub-rede.
 * @returns {number} Quantidade de endereços de host disponíveis.
 */
function calcularQuantidadeEnderecos(quantidadeZeros) {
    return Math.pow(2, quantidadeZeros) - 2;
}

/**
 * Função principal para calcular as sub-redes.
 * Recebe um endereço IP base, uma máscara de sub-rede e o número de sub-redes desejadas.
 * Calcula as informações de cada sub-rede,quantidade de estações, endereços da sub-rede, primeiro endereço, broadcast e máscara.
 * @param {string} ipBase - Endereço IP base no formato "xxx.xxx.xxx.xxx".
 * @param {string} mascara - Máscara de sub-rede no formato "/yy".
 * @param {number} numSubredes - Número de sub-redes desejadas.
 * @returns {Array} Array contendo objetos com informações de cada sub-rede calculada.
 */

function calcularSubredes(ipBase, mascara, numSubredes) {
    let ipBaseArray = ipBase.split('.').map(Number);
    let bitsSubrede = Math.ceil(Math.log2(numSubredes));
    let quantidadeZeros = contarZerosNaMascara(mascaraSubredeParaBinario(mascara));
    let hostsPorSubrede = Math.pow(2, quantidadeZeros) - 2;
    let subredes = [];
    let incremento = Math.pow(2, 8 - bitsSubrede);
    let enderecoRede = ipBaseArray.slice();
    let broadcastArray = ipBaseArray.slice();

    for (let i = 0; i < numSubredes; i++) {
        // Calcula o endereço de broadcast
        broadcastArray[3] = enderecoRede[3] + incremento - 1;
        
        // Ajuste para garantir que o broadcast não ultrapasse o limite da sub-rede
        if (broadcastArray[3] > 255) {
            broadcastArray[2] += 1;
            broadcastArray[3] = 255;
        }

        // Calcular o intervalo de endereços de hosts válidos
        let primeiroHostStr = `${enderecoRede[0]}.${enderecoRede[1]}.${enderecoRede[2]}.${enderecoRede[3] + 1}`;
        let ultimoHostStr = `${broadcastArray[0]}.${broadcastArray[1]}.${broadcastArray[2]}.${broadcastArray[3] - 1}`;

        // Adiciona as informações da sub-rede ao array de subredes
        subredes.push({
            qtdEstacoes: hostsPorSubrede,
            enderecosSubRede: `${primeiroHostStr} - ${ultimoHostStr}`,
            primeiroEndereco: `${enderecoRede[0]}.${enderecoRede[1]}.${enderecoRede[2]}.${enderecoRede[3]}`,
            broadcast: `${broadcastArray[0]}.${broadcastArray[1]}.${broadcastArray[2]}.${broadcastArray[3]}`,
            mascara: mascara
        });
         // Incrementa o endereço de rede e o endereço de broadcast para a próxima sub-rede
        enderecoRede[3] += incremento; 
        broadcastArray[3] += incremento;
    }

    return subredes;
}