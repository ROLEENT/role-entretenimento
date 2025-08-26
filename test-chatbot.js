// Test chatbot functionality
const testChatbot = async () => {
  console.log('🤖 Testando AI Chatbot...');
  
  try {
    const response = await fetch('https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/ai-chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "Oi! Quais eventos têm rolando em Porto Alegre essa semana?",
        chatHistory: [],
        userLocation: { city: "Porto Alegre", state: "RS" }
      })
    });

    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log('✅ Resposta:', data);
    
    return { 
      success: true, 
      message: data.message, 
      events: data.events,
      hasEvents: data.events && data.events.length > 0
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return { success: false, error: error.message };
  }
};

// Execute test
testChatbot().then(result => {
  if (result.success) {
    console.log('🎉 CHATBOT FUNCIONANDO!');
    console.log('Mensagem:', result.message);
    if (result.hasEvents) {
      console.log(`Eventos encontrados: ${result.events.length}`);
    }
  } else {
    console.log('❌ CHATBOT COM PROBLEMAS:', result.error);
  }
});

export { testChatbot };