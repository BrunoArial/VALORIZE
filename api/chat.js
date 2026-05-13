export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas método POST é permitido' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  // 1. Verifica se a chave foi carregada corretamente do arquivo .env
  if (!apiKey) {
    console.error("ERRO: GROQ_API_KEY não foi encontrada no arquivo .env");
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }

  if (!prompt) return res.status(400).json({ error: 'Nenhuma pergunta enviada' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: 'Você é o assistente financeiro inteligente do Valorize. Responda sempre em Português do Brasil de forma muito clara, objetiva e educada. Ajude com conceitos de investimentos, renda fixa e criptomoedas.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ]
      })
    });

    const data = await response.json();

    // 2. Se a Groq recusar (ex: chave inválida), loga o erro exato no terminal
    if (!response.ok) {
      console.error('⚠️ Erro retornado pela Groq:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Erro na API da Groq' });
    }
    
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('❌ Erro interno no servidor:', error);
    return res.status(500).json({ error: 'Falha de comunicação com a IA' });
  }
}