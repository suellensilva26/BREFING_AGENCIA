// CONFIGURAÇÃO EMAILJS - ENVIO DIRETO POR E-MAIL
// Este arquivo será configurado após criar a conta no EmailJS

// CONFIGURAÇÕES DO EMAILJS
const EMAILJS_CONFIG = {
    // SUBSTITUA PELOS SEUS DADOS DO EMAILJS
    publicKey: 'YOUR_PUBLIC_KEY',        // Chave pública do EmailJS
    serviceId: 'YOUR_SERVICE_ID',        // ID do serviço de e-mail
    templateId: 'YOUR_TEMPLATE_ID',      // ID do template de e-mail
    
    // E-MAIL DESTINATÁRIO
    toEmail: 'suellensilva.empresa@gmail.com',
    
    // CONFIGURAÇÕES DO E-MAIL
    emailSettings: {
        subject: 'Novo Briefing - Cleisson Viagem',
        fromName: 'Site Briefing'
    }
};

// INICIALIZAR EMAILJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('✅ EmailJS inicializado com sucesso!');
        return true;
    } else {
        console.error('❌ EmailJS não foi carregado');
        return false;
    }
}

// FUNÇÃO PARA ENVIAR E-MAIL
async function sendEmailViaEmailJS(formData) {
    try {
        // Verificar se EmailJS está inicializado
        if (!initEmailJS()) {
            throw new Error('EmailJS não foi inicializado');
        }
        
        // Preparar dados para o template
        const templateParams = {
            to_email: EMAILJS_CONFIG.toEmail,
            from_name: formData.seu_nome || 'Cliente',
            from_email: formData.seu_email || 'não informado',
            telefone: formData.seu_telefone || 'não informado',
            nome_empresa: formData.nome_completo || 'não informado',
            historia: formData.historia || 'não informado',
            tres_palavras: formData.tres_palavras || 'não informado',
            observacoes: formData.observacoes_finais || 'não informado',
            // Adicionar todos os dados do formulário
            ...formData,
            // Timestamp
            data_envio: new Date().toLocaleString('pt-BR'),
            // URL do site
            site_url: window.location.href
        };
        
        // Enviar e-mail
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        return response;
        
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw error;
    }
}

// FUNÇÃO PARA TESTAR CONFIGURAÇÃO
function testEmailJSConfig() {
    console.log('🔧 Configuração EmailJS:');
    console.log('Public Key:', EMAILJS_CONFIG.publicKey);
    console.log('Service ID:', EMAILJS_CONFIG.serviceId);
    console.log('Template ID:', EMAILJS_CONFIG.templateId);
    console.log('E-mail destinatário:', EMAILJS_CONFIG.toEmail);
    
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        console.warn('⚠️ EmailJS não foi configurado ainda!');
        return false;
    }
    
    return true;
}

// EXPORTAR FUNÇÕES
window.EMAILJS_CONFIG = EMAILJS_CONFIG;
window.sendEmailViaEmailJS = sendEmailViaEmailJS;
window.testEmailJSConfig = testEmailJSConfig;
window.initEmailJS = initEmailJS;

console.log('✅ Configuração EmailJS carregada!');
console.log('📧 Para configurar, acesse: https://www.emailjs.com/');
console.log('🧪 Para testar configuração, digite: testEmailJSConfig()');
