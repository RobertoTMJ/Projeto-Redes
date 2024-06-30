document.addEventListener("DOMContentLoaded", function() {
    let formulario = document.querySelector("#formulario");

    formulario.addEventListener("submit", function(event){
        event.preventDefault();

        let enderecoIP = formulario.querySelector("#endereco-ip").value;
        let mascaraBloco = formulario.querySelector("#mascara").value;
        let quantidadeSubRedes = parseInt(formulario.querySelector("#quantidade-subredes").value);

        try {
            let enderecoZerado = zerarUltimoOcteto(enderecoIP);
            console.log("Endereço IP com último octeto zerado:", enderecoZerado);

            let enderecoIPBinario = converteParaBinario(enderecoZerado);
            let mascaraBinaria = mascaraSubredeParaBinario(mascaraBloco);

            console.log("Endereço IP em binário:", enderecoIPBinario);
            console.log("Máscara de sub-rede em binário:", mascaraBinaria);

            let quantidadeZeros = contarZerosNaMascara(mascaraBinaria);
            console.log("Quantidade de bits zero na máscara:", quantidadeZeros);

            let quantidadeEnderecos = calcularQuantidadeEnderecos(quantidadeZeros);
            console.log("Quantidade de endereços válidos por sub-rede:", quantidadeEnderecos);

            let tabelaResultados = calcularSubredes(enderecoZerado, mascaraBloco, quantidadeSubRedes);  
            // limpa o main 
            let mainContainer = document.querySelector("main");
            mainContainer.innerHTML = "";

            // cria a tabela
            let tabela = document.createElement("table");
            tabela.classList.add("resultado-table");

            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");

            let cabecalho = `
                <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                </tr>
            `;
            thead.innerHTML = cabecalho;

            // Linhas da tabela com os resultados calculados
            let linhas = `
                <tr>
                    <td>Endereço IP com último octeto zerado</td>
                    <td>${enderecoZerado}</td>
                </tr>
                <tr>
                    <td>Endereço IP em binário</td>
                    <td>${enderecoIPBinario}</td>
                </tr>
                <tr>
                    <td>Máscara de sub-rede em binário</td>
                    <td>${mascaraBinaria}</td>
                </tr>
                <tr>
                    <td>Quantidade de bits zero na máscara</td>
                    <td>${quantidadeZeros}</td>
                </tr>
                <tr>
                    <td>Quantidade de endereços válidos por sub-rede</td>
                    <td>${quantidadeEnderecos}</td>
                </tr>
            `;
            tbody.innerHTML = linhas;

            tabela.appendChild(thead);
            tabela.appendChild(tbody);

            // Adiciona a tabela no lugar do main
            mainContainer.appendChild(tabela);

        } catch (error) {
            console.error(error.message); // Exibe qualquer erro no console do navegador
        }
    });


    formulario.addEventListener("reset", function(event){
        let mainContainer = document.querySelector("main");
        mainContainer.innerHTML = ""; // limpa o conteúdo do main
        mainContainer.appendChild(formulario); 

        let resultadosContainer = document.createElement("div");
        resultadosContainer.id = "resultados";
        mainContainer.appendChild(resultadosContainer); 
    });
});

function zerarUltimoOcteto(enderecoIP) {
    // Divide o endereço IP nos octetos
    let octetos = enderecoIP.split('.');
    
    // Verifica se o endereço IP possui quatro octetos
    if (octetos.length !== 4) {
        throw new Error('Endereço IP inválido.');
    }

    // Zera o último octeto
    octetos[3] = '0';

    // Retorna o endereço IP com o último octeto zerado
    return octetos.join('.');
}

function converteParaBinario(enderecoIP) {
    return enderecoIP.split('.')
        .map(octeto => {
            // Converte cada octeto para um número inteiro e, em seguida, para binário
            let binario = parseInt(octeto, 10).toString(2);
            // Garante que cada octeto tenha 8 bits, preenchendo com zeros à esquerda, se necessário
            return binario.padStart(8, '0');
        })
        .join('.');
}

function mascaraSubredeParaBinario(mascara) {
    // Verifica se a máscara está no formato correto
    if (!eMascaraSubredeValida(mascara)) {
        throw new Error('Máscara de sub-rede inválida.');
    }

    let prefixo = parseInt(mascara.split('/')[1]);
    let binario = '1'.repeat(prefixo).padEnd(32, '0');

    return `${parseInt(binario.slice(0,8), 2)}.${parseInt(binario.slice(8,16), 2)}.${parseInt(binario.slice(16,24), 2)}.${parseInt(binario.slice(24,32), 2)}`;
}

function eMascaraSubredeValida(mascara) {
    // Regex para validar a máscara de sub-rede no formato "/xx" ou "255.255.255.0"
    let regexMascara = /^\/([0-9]|[1-2][0-9]|3[0-2])$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regexMascara.test(mascara);
}

function contarZerosNaMascara(mascaraBinaria) {
    // Divide a máscara em seus quatro octetos
    let octetos = mascaraBinaria.split('.').map(octeto => parseInt(octeto, 10));
    
    // Conta a quantidade de bits zero em cada octeto
    let zeros = octetos.reduce((totalZeros, octeto) => {
        return totalZeros + (8 - octeto.toString(2).replace(/0/g, '').length);
    }, 0);

    return zeros;
}

function calcularQuantidadeEnderecos(quantidadeZeros) {
    // Calcula 2 elevado à quantidade de zeros na máscara - 2
    return Math.pow(2, quantidadeZeros) - 2;
}

function calcularSubredes(ipBase, mascara, numSubredes) {
    // Converter o IP base para um array de números
    let ipBaseArray = ipBase.split('.').map(Number);

    // Converter a máscara para um array de números
    let mascaraArray = mascara.split('.').map(Number);

    // Determinar o número de bits para as sub-redes
    let bitsSubrede = Math.ceil(Math.log2(numSubredes));

    // Calcular o número de hosts por sub-rede
    let hostsPorSubrede = Math.pow(2, 8 - bitsSubrede) - 2; // -2 para excluir o endereço de rede e o de broadcast

    // Array para armazenar as informações das sub-redes
    let subredes = [];

    // Calcular o incremento de cada sub-rede
    let incremento = Math.pow(2, 8 - bitsSubrede);

    // Iniciar com o endereço base
    let enderecoRede = ipBaseArray.slice(); // Cópia do array
    let broadcastArray = ipBaseArray.slice(); // Cópia do array

    for (let i = 0; i < numSubredes; i++) {
        // Calcular o broadcast da sub-rede atual
        broadcastArray[3] = enderecoRede[3] + incremento - 1;

        // Formatar os endereços como strings
        let enderecoRedeStr = enderecoRede.join('.');
        let primeiroHostStr = (enderecoRede[0]) + '.' + (enderecoRede[1]) + '.' + (enderecoRede[2]) + '.' + (enderecoRede[3] + 1);
        let ultimoHostStr = (broadcastArray[0]) + '.' + (broadcastArray[1]) + '.' + (broadcastArray[2]) + '.' + (broadcastArray[3] - 1);
        let broadcastStr = broadcastArray.join('.');

        // Armazenar na lista de sub-redes
        subredes.push({
            rede: enderecoRedeStr,
            hosts: primeiroHostStr + ' - ' + ultimoHostStr,
            broadcast: broadcastStr
        });

        // Avançar para a próxima sub-rede
        enderecoRede[3] += incremento;
        broadcastArray[3] += incremento;
    }

    return subredes;
}