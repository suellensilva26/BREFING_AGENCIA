// CONFIGURAÇÃO EMAILJS
const EMAILJS_CONFIG = {
    publicKey: 's4sU_9n94n1m2coPH',
    serviceId: 'service_f8qh341',
    templateId: 'lo75si4',
    toEmail: 'suellensilva.empresa@gmail.com'
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

// FUNÇÃO PARA ENVIAR E-MAIL VIA EMAILJS
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

// Configurações e Inicialização
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('briefingForm');
    
    // Smooth scroll para o topo ao carregar
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Validação em tempo real
    addRealTimeValidation();
    
    // Progress indicator
    createProgressIndicator();
    
    // Auto-save (opcional)
    enableAutoSave();
    
    // Submit handler
    form.addEventListener('submit', handleSubmit);
    
    // Animações de entrada
    animateOnScroll();
});

// Validação em tempo real (opcional)
function addRealTimeValidation() {
    // Validação suave para campos de email e telefone
    const emailFields = document.querySelectorAll('input[type="email"]');
    const telFields = document.querySelectorAll('input[type="tel"]');
    
    [...emailFields, ...telFields].forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    
    // Só valida se o campo tiver valor (não é obrigatório)
    if (!value) {
        clearFieldError(field);
        return true;
    }
    
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Por favor, insira um e-mail válido');
            return false;
        }
    }
    
    if (field.type === 'tel') {
        const phoneRegex = /^[\d\s\(\)\-\+]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Por favor, insira um telefone válido');
            return false;
        }
    }
    
    if (field.type === 'url') {
        try {
            new URL(value);
        } catch {
            showFieldError(field, 'Por favor, insira uma URL válida (ex: https://exemplo.com)');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.style.borderColor = '#ef4444';
    
    // Remove mensagem de erro anterior
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adiciona nova mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.85em';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    
    const errorMessage = field.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Indicador de progresso
function createProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, #10b981, #059669);
        z-index: 9999;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    // Atualizar progresso no scroll
    window.addEventListener('scroll', updateProgress);
    
    // Atualizar progresso ao preencher campos
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', updateProgress);
    });
}

function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    
    // Progresso baseado no scroll
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const scrollProgress = (scrolled / documentHeight) * 50; // 50% do progresso
    
    // Progresso baseado em campos preenchidos
    const allFields = document.querySelectorAll('input, textarea, select');
    const filledFields = Array.from(allFields).filter(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
            return field.checked;
        }
        return field.value.trim() !== '';
    });
    const fillProgress = (filledFields.length / allFields.length) * 50; // 50% do progresso
    
    const totalProgress = Math.min(scrollProgress + fillProgress, 100);
    progressBar.style.width = totalProgress + '%';
}

// Auto-save no LocalStorage
function enableAutoSave() {
    const form = document.getElementById('briefingForm');
    const formId = 'briefing_cleisson_viagem';
    
    // Carregar dados salvos
    loadFormData(formId);
    
    // Salvar a cada mudança
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', () => saveFormData(formId));
        input.addEventListener('input', debounce(() => saveFormData(formId), 1000));
    });
}

function saveFormData(formId) {
    const form = document.getElementById('briefingForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    // Salvar checkboxes
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        data[cb.name + '_checked_' + cb.value] = cb.checked;
    });
    
    // Salvar radio buttons
    const radios = form.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        if (radio.checked) {
            data[radio.name + '_selected'] = radio.value;
        }
    });
    
    localStorage.setItem(formId, JSON.stringify(data));
    
    // Mostrar indicador de salvamento
    showSaveIndicator();
}

function loadFormData(formId) {
    const savedData = localStorage.getItem(formId);
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        const form = document.getElementById('briefingForm');
        
        // Restaurar valores de texto
        Object.keys(data).forEach(key => {
            if (key.includes('_checked_')) {
                const [name, , ...valueParts] = key.split('_checked_');
                const value = valueParts.join('_checked_');
                const checkbox = form.querySelector(`input[name="${name}"][value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = data[key];
                }
            } else if (key.includes('_selected')) {
                const name = key.replace('_selected', '');
                const radio = form.querySelector(`input[name="${name}"][value="${data[key]}"]`);
                if (radio) {
                    radio.checked = true;
                }
            } else {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && field.type !== 'checkbox' && field.type !== 'radio') {
                    field.value = Array.isArray(data[key]) ? data[key][0] : data[key];
                }
            }
        });
        
        console.log('✅ Dados do formulário restaurados');
    } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
    }
}

function showSaveIndicator() {
    let indicator = document.getElementById('save-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 9998;
        `;
        indicator.textContent = '💾 Salvo automaticamente';
        document.body.appendChild(indicator);
    }
    
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    
    // Verificar se há campos vazios importantes
    const emptyFields = checkEmptyFields();
    
    if (emptyFields.length > 0) {
        showSmartValidation(emptyFields);
        return;
    }
    
    // Se chegou até aqui, pode enviar
    await submitForm(e.target);
}

// Verificar campos vazios importantes
function checkEmptyFields() {
    const importantFields = [
        { name: 'nome_completo', label: 'Nome completo da empresa' },
        { name: 'seu_nome', label: 'Seu nome completo' },
        { name: 'seu_email', label: 'Seu e-mail' },
        { name: 'seu_telefone', label: 'Seu WhatsApp' }
    ];
    
    const emptyFields = [];
    
    importantFields.forEach(field => {
        const element = document.querySelector(`[name="${field.name}"]`);
        if (element && !element.value.trim()) {
            emptyFields.push({
                name: field.name,
                label: field.label,
                element: element
            });
        }
    });
    
    return emptyFields;
}

// Mostrar validação inteligente
function showSmartValidation(emptyFields) {
    const modal = document.createElement('div');
    modal.id = 'smart-validation-modal';
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            ">
                <div style="
                    font-size: 3em;
                    margin-bottom: 20px;
                ">⚠️</div>
                
                <h3 style="
                    color: #000;
                    margin-bottom: 15px;
                    font-size: 1.3em;
                ">Alguns campos importantes estão vazios</h3>
                
                <p style="
                    color: #666;
                    margin-bottom: 20px;
                    line-height: 1.5;
                ">Você não respondeu:</p>
                
                <ul style="
                    text-align: left;
                    color: #333;
                    margin-bottom: 25px;
                    padding-left: 20px;
                ">
                    ${emptyFields.map(field => `<li>• ${field.label}</li>`).join('')}
                </ul>
                
                <p style="
                    color: #666;
                    margin-bottom: 25px;
                    font-size: 0.9em;
                ">Quanto mais informações você fornecer, melhor será o resultado!</p>
                
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                ">
                    <button id="fill-now-btn" style="
                        background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
                        color: #000;
                        border: 3px solid #000;
                        padding: 15px 30px;
                        font-size: 1.1em;
                        font-weight: 700;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">📝 RESPONDER AGORA</button>
                    
                    <button id="send-anyway-btn" style="
                        background: #f0f0f0;
                        color: #666;
                        border: 2px solid #ddd;
                        padding: 12px 30px;
                        font-size: 1em;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">📤 ENVIAR MESMO ASSIM</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('fill-now-btn').addEventListener('click', () => {
        modal.remove();
        scrollToFirstEmptyField(emptyFields[0]);
    });
    
    document.getElementById('send-anyway-btn').addEventListener('click', () => {
        modal.remove();
        submitForm(document.getElementById('briefingForm'));
    });
}

// Scroll para o primeiro campo vazio
function scrollToFirstEmptyField(emptyField) {
    if (emptyField && emptyField.element) {
        emptyField.element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Destacar o campo
        emptyField.element.style.borderColor = '#FFD700';
        emptyField.element.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.3)';
        emptyField.element.focus();
        
        // Remover destaque após 3 segundos
        setTimeout(() => {
            emptyField.element.style.borderColor = '';
            emptyField.element.style.boxShadow = '';
        }, 3000);
    }
}

// Enviar formulário via EmailJS
async function submitForm(form) {
    // Mostrar loading
    showLoading();
    
    try {
        // Coletar dados do formulário
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Preparar template para EmailJS
        const templateParams = {
            to_email: 'suellensilva.empresa@gmail.com',
            from_name: data.seu_nome || 'Cliente',
            from_email: data.seu_email || 'não informado',
            telefone: data.seu_telefone || 'não informado',
            nome_empresa: data.nome_completo || 'não informado',
            historia: data.historia || 'não informado',
            tres_palavras: data.tres_palavras || 'não informado',
            observacoes: data.observacoes_finais || 'não informado',
            // Adicionar todos os outros campos
            ...data
        };
        
        // Enviar via EmailJS
        const response = await sendEmailViaEmailJS(data);
        
        hideLoading();
        
        if (response.status === 200) {
            showSuccess();
            // Limpar localStorage
            localStorage.removeItem('briefing_cleisson_viagem');
            // Reset form
            form.reset();
        } else {
            throw new Error('Erro ao enviar e-mail');
        }
    } catch (error) {
        hideLoading();
        showError('Erro ao enviar briefing: ' + error.message);
    }
}

function showLoading() {
    let loading = document.querySelector('.loading');
    
    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="spinner"></div>
                <p style="margin-top: 20px; font-size: 1.2em;">Enviando seu briefing...</p>
            </div>
        `;
        document.body.appendChild(loading);
    }
    
    loading.classList.add('active');
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.classList.remove('active');
    }
}

function showSuccess() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message active';
    successDiv.innerHTML = `
        <div class="success-icon">🎉</div>
        <h3>Briefing Enviado com Sucesso!</h3>
        <p>Obrigado por compartilhar suas informações! Seu briefing foi recebido e será analisado.</p>
        <p style="margin-top: 20px; font-weight: 600; color: #FFD700;">Entraremos em contato em até 48 horas para conversar sobre seu projeto!</p>
        <p style="margin-top: 15px; font-size: 0.9em; color: #666;">Lembre-se: quanto mais informações você forneceu, melhor será o resultado final.</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
            color: #000;
            border: 2px solid #000;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 600;
        ">Fechar</button>
    `;
    document.body.appendChild(successDiv);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError(message) {
    alert(`❌ Erro ao enviar o formulário: ${message}\n\nPor favor, tente novamente ou entre em contato conosco diretamente.`);
}

// Animações ao scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
}

// Contador de caracteres para textareas grandes
function addCharacterCount() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.8em;
            color: #64748b;
            margin-top: 5px;
        `;
        
        textarea.parentElement.appendChild(counter);
        
        function updateCount() {
            const count = textarea.value.length;
            counter.textContent = `${count} caracteres`;
        }
        
        textarea.addEventListener('input', updateCount);
        updateCount();
    });
}

// Chamar função de contador
addCharacterCount();

// Função para exportar dados (útil para debug)
function exportFormData() {
    const form = document.getElementById('briefingForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    console.log('Dados do formulário:', data);
    return data;
}

// Tornar disponível globalmente para debug
window.exportFormData = exportFormData;

// Mensagem de confirmação ao sair se houver dados não salvos
window.addEventListener('beforeunload', function(e) {
    const form = document.getElementById('briefingForm');
    const formData = new FormData(form);
    let hasData = false;
    
    for (let [key, value] of formData.entries()) {
        if (value && value.trim() !== '') {
            hasData = true;
            break;
        }
    }
    
    if (hasData) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

console.log('✅ Formulário Briefing Cleisson Viagem carregado com sucesso!');
console.log('💾 Auto-save ativado - seus dados são salvos automaticamente');
console.log('📊 Para ver os dados do formulário, digite: exportFormData()');

