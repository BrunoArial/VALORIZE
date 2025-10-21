# VALORIZE - Hub de Finanças

**Link do Projeto: [https://brunoarial.github.io/VALORIZE/](https://brunoarial.github.io/VALORIZE/)**

## Sobre o Projeto

O **VALORIZE** é um hub de finanças completo, projetado como um ponto de partida ideal para investidores iniciantes. A plataforma oferece um conjunto de dashboards e ferramentas interativas que simplificam a compreensão do mercado financeiro, permitindo simulações, acompanhamento de cotações em tempo real e cálculos de rentabilidade de forma clara e acessível.

## Funcionalidades Principais

A plataforma é dividida em quatro grandes seções:

### 1. Máquina do Tempo (Backtesting)
Uma poderosa ferramenta de *backtesting* que permite ao usuário "voltar no tempo". Ela simula o que teria acontecido se você tivesse investido um valor fixo, todo mês, em um ou mais ativos da bolsa de valores (utilizando dados da API Brapi).

### 2. Área Cripto
Um dashboard completo e em tempo real do mercado de criptomoedas, dividido em:
* **Gráfico Principal:** Um gráfico interativo de velas fornecido pelo TradingView.
* **Cards de Cotação:** Uma grade com as principais criptomoedas do mercado (Bitcoin, Ethereum, etc.), exibindo preço em R$, variação 24h e outros dados fornecidos pela API da CoinGecko, com atualização automática.

### 3. Renda Fixa
Um conjunto de simuladores focados nos principais investimentos de renda fixa do Brasil:
* **Tesouro Direto:** Calcula o rendimento líquido do seu investimento no Tesouro, projetando o valor final já com os descontos do Imposto de Renda (IR) e da Taxa de Custódia da B3.
* **LCI / LCA vs CDB:** Uma calculadora de equivalência que calcula qual a rentabilidade que um CDB precisaria ter para ser igual a uma LCI (e vice-versa), com base no prazo do investimento (que define a alíquota do imposto).
* **CDB:** Simula o rendimento de um CDB Pós-Fixado (atrelado ao CDI), permitindo inserir aportes, prazo e a rentabilidade oferecida pelo banco.
* **Comparador Universal: ** Um comparador que permite uma comparação "maçã com maçã" entre diferentes tipos de investimentos (todos apresentados na aba de renda fixa).

### 4. Índices Econômicos
Um dashboard de indicadores econômicos que exibe os principais índices do mercado financeiro, separados entre:
* **Nacionais:** IBOVESPA, IFIX, SELIC, CDI, etc.
* **Globais:** S&P 500, NASDAQ, DOW JONES, etc.

## Tecnologias Utilizadas

Este projeto foi construído puramente com tecnologias web front-end, sem a necessidade de frameworks complexos:

* **HTML5**
* **CSS3** (com design responsivo)
* **JavaScript (ES6+)** (para lógica, cálculos e consumo de APIs)

## APIs e Serviços Externos

Os dados dinâmicos do projeto são consumidos em tempo real das seguintes fontes:

* **[Brapi](https://brapi.dev/)**: Fornece os dados históricos de ações para a "Máquina do Tempo".
* **[CoinGecko API](https://www.coingecko.com/pt/api)**: Alimenta a "Área Cripto" com preços e variações.
* **[TradingView Widgets](https://br.tradingview.com/)**: Utilizado para o gráfico de velas interativo.

## Como Acessar o Projeto

### Acesso Online (Deploy)
O projeto está hospedado no GitHub Pages e pode ser acessado diretamente pelo link:

**[https://brunoarial.github.io/VALORIZE/](https://brunoarial.github.io/VALORIZE/)**
