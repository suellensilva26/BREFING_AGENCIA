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

// Validação em tempo real
function addRealTimeValidation() {
    const requiredFields = document.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
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
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Por favor, insira um e-mail válido');
            return false;
        }
    }
    
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\(\)\-\+]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Por favor, insira um telefone válido');
            return false;
        }
    }
    
    if (field.type === 'url' && value) {
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
    
    // Validar todos os campos obrigatórios
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('⚠️ Por favor, preencha todos os campos obrigatórios corretamente.');
        // Scroll para o primeiro erro
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Mostrar loading
    showLoading();
    
    try {
        // Enviar formulário
        const formData = new FormData(e.target);
        const response = await fetch(e.target.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        hideLoading();
        
        if (response.ok) {
            showSuccess();
            // Limpar localStorage
            localStorage.removeItem('briefing_cleisson_viagem');
            // Reset form
            e.target.reset();
        } else {
            throw new Error('Erro ao enviar formulário');
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
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
        <div class="success-icon">✅</div>
        <h3>Briefing Enviado com Sucesso!</h3>
        <p>Obrigado por compartilhar suas informações. Você receberá uma confirmação por e-mail em breve.</p>
        <p style="margin-top: 20px;">Entraremos em contato em até 48 horas.</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 30px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
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

