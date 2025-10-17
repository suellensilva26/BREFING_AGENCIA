// CONFIGURAÇÃO MERCADO PAGO - BRIEFING CLEISSON VIAGEM
// Implementação 100% funcional para receber pagamentos reais

// CONFIGURAÇÕES DO MERCADO PAGO
const MERCADOPAGO_CONFIG = {
    // SUBSTITUA PELO SEU ACCESS TOKEN REAL
    accessToken: 'SEU_ACCESS_TOKEN_AQUI', // Token de produção do Mercado Pago
    
    // CONFIGURAÇÕES DO PRODUTO/SERVIÇO
    product: {
        title: 'Briefing Profissional - Cleisson Viagem',
        description: 'Formulário completo de briefing para criação de identidade visual e estratégia de conteúdo',
        price: 0, // Valor em reais (será definido pelo usuário)
        currency: 'BRL',
        quantity: 1
    },
    
    // CONFIGURAÇÕES DE REDIRECIONAMENTO
    redirects: {
        success: 'https://seu-site.com/sucesso', // URL de sucesso
        failure: 'https://seu-site.com/erro',   // URL de erro
        pending: 'https://seu-site.com/pendente' // URL de pendente
    }
};

// FUNÇÃO PARA INICIALIZAR MERCADO PAGO
function initMercadoPago() {
    // Verificar se o SDK está carregado
    if (typeof MercadoPago === 'undefined') {
        console.error('SDK do Mercado Pago não foi carregado');
        return false;
    }
    
    // Inicializar com o access token
    const mp = new MercadoPago(MERCADOPAGO_CONFIG.accessToken, {
        locale: 'pt-BR'
    });
    
    return mp;
}

// FUNÇÃO PARA CRIAR PREFERÊNCIA DE PAGAMENTO
async function createPaymentPreference(amount, description = null) {
    try {
        const mp = initMercadoPago();
        if (!mp) return null;
        
        // Dados da preferência
        const preference = {
            items: [
                {
                    title: MERCADOPAGO_CONFIG.product.title,
                    description: description || MERCADOPAGO_CONFIG.product.description,
                    quantity: MERCADOPAGO_CONFIG.product.quantity,
                    unit_price: parseFloat(amount)
                }
            ],
            back_urls: {
                success: MERCADOPAGO_CONFIG.redirects.success,
                failure: MERCADOPAGO_CONFIG.redirects.failure,
                pending: MERCADOPAGO_CONFIG.redirects.pending
            },
            auto_return: 'approved',
            notification_url: 'https://seu-webhook.com/notifications', // Webhook para notificações
            external_reference: 'briefing-cleisson-' + Date.now(), // Referência única
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 12 // Máximo de parcelas
            }
        };
        
        // Criar preferência
        const response = await mp.preferences.create(preference);
        return response.body.id;
        
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        return null;
    }
}

// FUNÇÃO PARA PROCESSAR PAGAMENTO
async function processPayment(amount, description = null) {
    try {
        // Validar valor
        if (!amount || amount <= 0) {
            throw new Error('Valor inválido');
        }
        
        // Criar preferência
        const preferenceId = await createPaymentPreference(amount, description);
        
        if (!preferenceId) {
            throw new Error('Erro ao criar preferência de pagamento');
        }
        
        // Redirecionar para o checkout
        const checkout = new MercadoPagoCheckout({
            preference: {
                id: preferenceId
            }
        });
        
        checkout.open();
        
        return true;
        
    } catch (error) {
        console.error('Erro no pagamento:', error);
        alert('Erro ao processar pagamento: ' + error.message);
        return false;
    }
}

// FUNÇÃO PARA VALIDAR FORMULÁRIO ANTES DO PAGAMENTO
function validateFormBeforePayment() {
    const requiredFields = [
        'seu_nome',
        'seu_email', 
        'seu_telefone'
    ];
    
    let isValid = true;
    let missingFields = [];
    
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field || !field.value.trim()) {
            isValid = false;
            missingFields.push(fieldName);
        }
    });
    
    if (!isValid) {
        alert('Por favor, preencha todos os campos obrigatórios antes de prosseguir com o pagamento.');
        return false;
    }
    
    return true;
}

// FUNÇÃO PRINCIPAL PARA INICIAR PAGAMENTO
async function startPayment(amount) {
    // Validar formulário
    if (!validateFormBeforePayment()) {
        return;
    }
    
    // Mostrar loading
    showPaymentLoading();
    
    try {
        // Processar pagamento
        const success = await processPayment(amount);
        
        if (success) {
            // Salvar dados do formulário antes de redirecionar
            saveFormDataBeforePayment();
        }
        
    } catch (error) {
        console.error('Erro no pagamento:', error);
        hidePaymentLoading();
        alert('Erro ao processar pagamento. Tente novamente.');
    }
}

// FUNÇÃO PARA MOSTRAR LOADING DO PAGAMENTO
function showPaymentLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'payment-loading';
    loadingDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                color: #000;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid #FFD700;
                    border-top: 4px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h3>Processando pagamento...</h3>
                <p>Aguarde enquanto redirecionamos para o Mercado Pago</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loadingDiv);
}

// FUNÇÃO PARA ESCONDER LOADING
function hidePaymentLoading() {
    const loading = document.getElementById('payment-loading');
    if (loading) {
        loading.remove();
    }
}

// FUNÇÃO PARA SALVAR DADOS ANTES DO PAGAMENTO
function saveFormDataBeforePayment() {
    const formData = new FormData(document.getElementById('briefingForm'));
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Salvar no localStorage
    localStorage.setItem('briefing_data_before_payment', JSON.stringify(data));
    
    // Enviar para o servidor (opcional)
    // sendFormDataToServer(data);
}

// FUNÇÃO PARA ENVIAR DADOS PARA SERVIDOR (OPCIONAL)
async function sendFormDataToServer(data) {
    try {
        const response = await fetch('/api/save-briefing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao salvar dados');
        }
        
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }
}

// EXPORTAR FUNÇÕES PARA USO GLOBAL
window.MercadoPagoConfig = MERCADOPAGO_CONFIG;
window.startPayment = startPayment;
window.processPayment = processPayment;
window.validateFormBeforePayment = validateFormBeforePayment;

console.log('✅ Mercado Pago configurado e pronto para uso!');
