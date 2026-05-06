# VALORIZE | Dashboard Financeiro Inteligente

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript (Vanilla)](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![API Integração](https://img.shields.io/badge/API-Integração-00529B?style=for-the-badge)

O **Valorize** nasceu com um propósito educacional: democratizar o entendimento financeiro. Ao longo do seu desenvolvimento, o projeto evoluiu e pivotou para se tornar um **Smart Dashboard Financeiro** completo, permitindo que os usuários não apenas aprendam sobre finanças, mas gerenciem seu fluxo de caixa, renda fixa e criptoativos em um único ecossistema seguro e responsivo.

 **[Acesse o projeto ao vivo aqui]** *(https://brunoarial.github.io/VALORIZE/)*

---

##  Funcionalidades e Ecossistema

O hub é dividido em módulos inteligentes que conversam entre si, consolidando os dados em um Dashboard central (Visão Geral).

###  Visão Geral (Dashboard)
* **Gráficos Dinâmicos:** Comparativo de Evolução Patrimonial x CDI e Fluxo de Caixa, renderizados nativamente via Canvas API.
* **Índices Econômicos (Simulação Arquitetural):** A exibição de índices como Ibovespa, IFIX, Dólar e Euro foi estruturada através de uma simulação local de dados (`MOCK_DATA`). Essa decisão técnica foi tomada pois APIs de mercado financeiro tradicionais em tempo real possuem custos elevados ou restrições severas de requisições (*rate limits*). O mock demonstra a capacidade da interface de gerar mini-gráficos (sparklines) dinâmicos e tratar variações percentuais sem depender de serviços terceiros onerosos.
* **Carteira Cripto Consolidada:** Leitura instantânea do portfólio de criptomoedas, convertendo o saldo do usuário para BRL em tempo real com gráficos gerados em SVG puro.

###  Fluxo de Caixa
* Lançamento de Receitas e Despesas com categorização inteligente.
* Motor de busca que identifica palavras-chave na descrição (ex: "Ifood", "Uber", "Salário") e atribui ícones automáticos aos lançamentos.
* Exportação nativa do histórico financeiro para `.CSV` (compatível com Excel/Sheets).

###  Renda Fixa
* Gestão de ativos (CDB, LCI, LCA, Tesouro Direto).
* Cálculo automático de dias restantes para o vencimento de cada título.
* O motor de gráficos simula o crescimento da carteira de trás para frente, criando uma curva de evolução patrimonial baseada na matemática de juros compostos.

###  Criptomoedas
* Integração com a API da **CoinGecko** para cotações globais em BRL, volume 24h e variação de mercado de forma gratuita e fluida.
* Gestor de saldo local: o usuário informa quanto possui de cada moeda, e a plataforma calcula o patrimônio instantaneamente.
* Injeção sob demanda do widget do **TradingView**: ao clicar em qualquer moeda, um gráfico profissional de candlesticks é renderizado na tela para análise técnica.

---

## 🛠️ Decisões de Arquitetura e Engenharia

Este projeto foi construído **sem o uso de frameworks (Vanilla JS)** para consolidar e demonstrar um domínio profundo dos fundamentos do desenvolvimento web.

1. **Gráficos Nativos (Canvas API):**
   * Nenhuma biblioteca de terceiros (como Chart.js ou ApexCharts) foi utilizada. Desenvolvi um motor de renderização gráfica do zero usando o `<canvas>` do HTML5. Isso garante alta performance, manipulação direta de pixels e controle total sobre o escalonamento responsivo (DPR - Device Pixel Ratio) para telas de alta resolução.
2. **Privacidade por Design (Privacy-First):**
   * O sistema opera com a arquitetura `Zero-Backend`. Todos os dados financeiros inseridos pelo usuário são associados a IDs únicos (UUIDs) e armazenados exclusivamente no `localStorage` do navegador. Nenhum dado financeiro trafega pela rede de forma descriptografada, garantindo 100% de privacidade ao usuário.
3. **UI/UX e Design System:**
   * Interface moderna baseada em tokens CSS (CSS Variables), garantindo consistência visual (cores, espaçamentos, tipografia) e facilitando a implementação futura de temas alternativos (ex: Dark Mode). Layout totalmente responsivo utilizando CSS Grid e Flexbox.

---

## Sobre o Autor
Desenvolvido por Bruno Arial Ramos, estudante de Engenharia da Computação.
Este projeto reflete minha paixão por criar interfaces limpas e arquiteturas de software eficientes, unindo o desenvolvimento Front-end ao consumo inteligente de APIs, matemática financeira e estruturas de dados no lado do cliente.

💼 LinkedIn: https://linkedin.com/in/brunoarial • 💻 GitHub: https://github.com/BrunoArial • 📧 brunoarial@gmail.com