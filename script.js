// ============================================================
// CONFIGURAÇÃO DO EMAILJS
// Substitua os valores abaixo após criar sua conta em emailjs.com
// Email destino: nucart.sma.rs@pf.gov.br
// (Configurar este email como destinatário no template do EmailJS)
// ============================================================
const EMAILJS_PUBLIC_KEY = '0rBAZ3QwWOcCMrD47';
const EMAILJS_SERVICE_ID = 'service_uag29i2';
const EMAILJS_TEMPLATE_ID = 'template_9o3zsfp';
const EMAIL_DESTINO = 'nucart.sma.rs@pf.gov.br';

// Inicializa o EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ============================================================
// MÁSCARAS DE CAMPOS
// ============================================================

function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraTelefone(valor) {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 10) {
        return nums
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return nums
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

function mascaraCEP(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

// Aplica as máscaras nos campos
document.getElementById('cpf').addEventListener('input', function () {
    this.value = mascaraCPF(this.value);
});

document.getElementById('telefone').addEventListener('input', function () {
    this.value = mascaraTelefone(this.value);
});

document.getElementById('cep').addEventListener('input', function () {
    this.value = mascaraCEP(this.value);
});

// ============================================================
// VALIDAÇÃO DE CPF
// ============================================================

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// ============================================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================================

function mostrarErro(campo, mensagem) {
    campo.classList.add('invalid');
    let errEl = campo.parentElement.querySelector('.error-msg');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.classList.add('error-msg');
        campo.parentElement.appendChild(errEl);
    }
    errEl.textContent = mensagem;
}

function limparErro(campo) {
    campo.classList.remove('invalid');
    const errEl = campo.parentElement.querySelector('.error-msg');
    if (errEl) errEl.textContent = '';
}

function validarFormulario() {
    let valido = true;
    const campos = document.querySelectorAll('#form-qualificacao [required]');

    campos.forEach(campo => {
        limparErro(campo);
        if (!campo.value.trim()) {
            mostrarErro(campo, 'Este campo é obrigatório.');
            valido = false;
        }
    });

    // Validação específica do CPF
    const cpfCampo = document.getElementById('cpf');
    limparErro(cpfCampo);
    if (cpfCampo.value.trim() && !validarCPF(cpfCampo.value)) {
        mostrarErro(cpfCampo, 'CPF inválido.');
        valido = false;
    } else if (!cpfCampo.value.trim()) {
        mostrarErro(cpfCampo, 'Este campo é obrigatório.');
        valido = false;
    }

    // Validação do telefone (mínimo 10 dígitos)
    const telCampo = document.getElementById('telefone');
    const telNum = telCampo.value.replace(/\D/g, '');
    if (telNum.length > 0 && telNum.length < 10) {
        mostrarErro(telCampo, 'Telefone inválido (mínimo 10 dígitos).');
        valido = false;
    }

    // Validação do email (se preenchido)
    const emailCampo = document.getElementById('email');
    if (emailCampo.value.trim()) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(emailCampo.value.trim())) {
            mostrarErro(emailCampo, 'Email inválido.');
            valido = false;
        }
    }

    // Validação do CEP (8 dígitos)
    const cepCampo = document.getElementById('cep');
    const cepNum = cepCampo.value.replace(/\D/g, '');
    if (cepNum.length > 0 && cepNum.length < 8) {
        mostrarErro(cepCampo, 'CEP inválido.');
        valido = false;
    }

    // Validação dos documentos (se anexados, máximo 5MB cada)
    var docFrente = document.getElementById('doc_identidade');
    if (docFrente.files.length > 0 && docFrente.files[0].size > 5 * 1024 * 1024) {
        mostrarErro(docFrente, 'Arquivo muito grande (máximo 5MB).');
        valido = false;
    }
    var docVerso = document.getElementById('doc_identidade_verso');
    if (docVerso.files.length > 0 && docVerso.files[0].size > 5 * 1024 * 1024) {
        mostrarErro(docVerso, 'Arquivo muito grande (máximo 5MB).');
        valido = false;
    }

    return valido;
}

// Limpa erros ao digitar
document.querySelectorAll('#form-qualificacao input, #form-qualificacao select').forEach(campo => {
    campo.addEventListener('input', () => limparErro(campo));
    campo.addEventListener('change', () => limparErro(campo));
});

// ============================================================
// COMPRESSÃO DE IMAGEM
// ============================================================

function comprimirImagem(file, maxWidth, qualidade) {
    return new Promise(function (resolve) {
        if (!file) { resolve(null); return; }

        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var largura = img.width;
                var altura = img.height;

                if (largura > maxWidth) {
                    altura = Math.round((altura * maxWidth) / largura);
                    largura = maxWidth;
                }

                canvas.width = largura;
                canvas.height = altura;
                canvas.getContext('2d').drawImage(img, 0, 0, largura, altura);

                resolve(canvas.toDataURL('image/jpeg', qualidade));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ============================================================
// PRÉ-VISUALIZAÇÃO DO DOCUMENTO
// ============================================================

function configurarPreview(inputId, previewId) {
    document.getElementById(inputId).addEventListener('change', function () {
        var preview = document.getElementById(previewId);
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.hidden = false;
            };
            reader.readAsDataURL(this.files[0]);
        } else {
            preview.src = '';
            preview.hidden = true;
        }
    });
}

configurarPreview('doc_identidade', 'preview-doc');
configurarPreview('doc_identidade_verso', 'preview-doc-verso');

// ============================================================
// ENVIO DO FORMULÁRIO
// ============================================================

function mostrarMensagem(texto, tipo) {
    const el = document.getElementById('mensagem-status');
    el.textContent = texto;
    el.className = 'mensagem-status ' + tipo;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('form-qualificacao').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validarFormulario()) {
        const primeiroErro = document.querySelector('.invalid');
        if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const btn = document.getElementById('btn-enviar');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    // Monta o endereço completo
    const endereco = [
        document.getElementById('rua').value,
        'nº ' + document.getElementById('numero').value,
        document.getElementById('complemento').value,
        document.getElementById('bairro').value,
        document.getElementById('cidade').value + '/' + document.getElementById('uf').value,
        'CEP ' + document.getElementById('cep').value
    ].filter(Boolean).join(', ');

    // Comprime as imagens (se houver) e envia
    var arquivoFrente = document.getElementById('doc_identidade').files[0];
    var arquivoVerso = document.getElementById('doc_identidade_verso').files[0];

    Promise.all([
        comprimirImagem(arquivoFrente, 800, 0.6),
        comprimirImagem(arquivoVerso, 800, 0.6)
    ]).then(function (imagens) {

        // Dados para o template do EmailJS
        var dadosEmail = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            rg: document.getElementById('rg').value,
            data_nascimento: document.getElementById('data_nascimento').value.split('-').reverse().join('/'),
            estado_civil: document.getElementById('estado_civil').value,
            profissao: document.getElementById('profissao').value,
            escolaridade: document.getElementById('escolaridade').value,
            nome_mae: document.getElementById('nome_mae').value,
            nome_pai: document.getElementById('nome_pai').value || 'Não informado',
            naturalidade: document.getElementById('naturalidade').value,
            endereco: endereco,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value || 'Não informado',
            num_procedimento: document.getElementById('num_procedimento').value,
            email_destino: EMAIL_DESTINO,
            doc_identidade: imagens[0] || 'Não anexado',
            doc_identidade_verso: imagens[1] || 'Não anexado'
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, dadosEmail)
            .then(function () {
                mostrarMensagem('Dados enviados com sucesso! A Polícia Federal em Santa Maria receberá suas informações.', 'sucesso');
                document.getElementById('form-qualificacao').reset();
                document.getElementById('preview-doc').hidden = true;
                document.getElementById('preview-doc-verso').hidden = true;
            })
            .catch(function (erro) {
                console.error('Erro ao enviar:', erro);
                mostrarMensagem('Erro ao enviar os dados. Verifique sua conexão e tente novamente. Se o problema persistir, entre em contato com a delegacia.', 'erro');
            })
            .finally(function () {
                btn.disabled = false;
                btn.textContent = 'Enviar Dados';
            });
    });
});

// Limpa mensagem de status ao resetar o formulário
document.getElementById('form-qualificacao').addEventListener('reset', function () {
    document.getElementById('mensagem-status').hidden = true;
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
});

// ============================================================
// BUSCA DE CEP VIA API (ViaCEP)
// ============================================================

document.getElementById('cep').addEventListener('blur', function () {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    fetch('https://viacep.com.br/ws/' + cep + '/json/')
        .then(res => res.json())
        .then(data => {
            if (data.erro) return;
            if (data.logradouro) document.getElementById('rua').value = data.logradouro;
            if (data.bairro) document.getElementById('bairro').value = data.bairro;
            if (data.localidade) document.getElementById('cidade').value = data.localidade;
            if (data.uf) document.getElementById('uf').value = data.uf;
        })
        .catch(() => {});
});
