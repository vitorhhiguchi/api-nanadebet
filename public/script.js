const API_URL = window.location.origin;

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3000);
}

// 1. Carregar Chave Pública
async function loadPublicKey() {
  const display = document.getElementById('public-key-display');
  const btn = document.getElementById('btn-load-key');
  
  try {
    btn.disabled = true;
    display.textContent = 'Carregando chave pública...';
    
    const response = await fetch(`${API_URL}/crypto/public-key`);
    if (!response.ok) throw new Error('Falha ao obter chave pública');
    
    const data = await response.json();
    display.textContent = data.publicKey;
    showToast('Chave pública carregada', 'success');
  } catch (error) {
    display.textContent = `Erro: ${error.message}`;
    showToast('Erro ao carregar chave', 'error');
  } finally {
    btn.disabled = false;
  }
}

// 2. Demo: Cifrar Dados
let currentEncryptedData = null;

async function encryptData() {
  const inputElem = document.getElementById('demo-input');
  const resultElem = document.getElementById('encrypted-result');
  const btnEncrypt = document.getElementById('btn-encrypt');
  const btnDecrypt = document.getElementById('btn-decrypt');
  
  try {
    const data = JSON.parse(inputElem.value);
    
    btnEncrypt.disabled = true;
    resultElem.className = 'result-box';
    resultElem.textContent = 'Cifrando...';
    
    // Na prática o cliente faria isso localmente (ex: Web Crypto API).
    // Usamos o endpoint de demonstração para facilitar.
    const response = await fetch(`${API_URL}/crypto/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao cifrar');
    }
    
    const result = await response.json();
    currentEncryptedData = result.dadosCifrados;
    
    resultElem.className = 'result-box encrypted';
    resultElem.textContent = JSON.stringify(currentEncryptedData, null, 2);
    
    btnDecrypt.disabled = false;
    showToast('Dados cifrados com sucesso', 'success');
  } catch (error) {
    resultElem.className = 'result-box success';
    resultElem.textContent = `Erro: ${error.message}`;
    showToast(error.message, 'error');
  } finally {
    btnEncrypt.disabled = false;
  }
}

// 3. Demo: Decifrar Dados
async function decryptData() {
  const resultElem = document.getElementById('decrypted-result');
  const btnDecrypt = document.getElementById('btn-decrypt');
  
  if (!currentEncryptedData) return;
  
  try {
    btnDecrypt.disabled = true;
    resultElem.className = 'result-box';
    resultElem.textContent = 'Decifrando...';
    
    const response = await fetch(`${API_URL}/crypto/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentEncryptedData)
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao decifrar');
    }
    
    const result = await response.json();
    
    resultElem.className = 'result-box success';
    resultElem.textContent = JSON.stringify(result.dadosDecifrados, null, 2);
    
    showToast('Dados decifrados com sucesso', 'success');
  } catch (error) {
    resultElem.className = 'result-box success';
    resultElem.textContent = `Erro: ${error.message}`;
    showToast(error.message, 'error');
  } finally {
    btnDecrypt.disabled = false;
  }
}

// 4. Apostas CRUD
function appendLog(section, title, content) {
  const container = document.getElementById(`${section}-log`);
  const contentDiv = container.querySelector('.log-content');
  
  container.classList.remove('hidden');
  
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'log-section';
  
  sectionDiv.innerHTML = `
    <div class="log-label">${title}</div>
    <div class="log-body">${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</div>
  `;
  
  contentDiv.prepend(sectionDiv);
}

async function createAposta(event) {
  event.preventDefault();
  
  const btnCreate = document.getElementById('btn-create');
  const useEncryption = document.getElementById('toggle-encrypt').checked;
  const logContainer = document.getElementById('create-log');
  
  // Limpar logs antigos
  logContainer.querySelector('.log-content').innerHTML = '';
  
  const aposta = {
    idApostador: parseInt(document.getElementById('input-apostador').value),
    valor: parseFloat(document.getElementById('input-valor').value),
    idLuta: parseInt(document.getElementById('input-luta').value),
    idLutador1: document.getElementById('input-lutador1').value ? parseInt(document.getElementById('input-lutador1').value) : null,
    idLutador2: document.getElementById('input-lutador2').value ? parseInt(document.getElementById('input-lutador2').value) : null
  };
  
  try {
    btnCreate.disabled = true;
    let payload = aposta;
    let headers = { 'Content-Type': 'application/json' };
    
    appendLog('create', 'Dados Originais', aposta);
    
    if (useEncryption) {
      showToast('Cifrando dados...', 'info');
      // Simulando a criptografia no lado do cliente
      const encResponse = await fetch(`${API_URL}/crypto/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aposta)
      });
      
      const encData = await encResponse.json();
      payload = encData.dadosCifrados;
      headers['X-Encrypted'] = 'true';
      
      appendLog('create', 'Payload Cifrado Enviado', payload);
      appendLog('create', 'Headers', headers);
    }
    
    showToast('Enviando requisição...', 'info');
    const response = await fetch(`${API_URL}/apostas`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    appendLog('create', 'Resposta do Servidor', result);
    
    if (response.ok) {
      showToast('Aposta criada com sucesso!', 'success');
      event.target.reset();
      loadApostas();
    } else {
      throw new Error(result.error || 'Erro ao criar aposta');
    }
  } catch (error) {
    appendLog('create', 'Erro', error.message);
    showToast(error.message, 'error');
  } finally {
    btnCreate.disabled = false;
  }
}

async function loadApostas() {
  const listElem = document.getElementById('apostas-list');
  const btnRefresh = document.getElementById('btn-refresh');
  
  try {
    btnRefresh.disabled = true;
    listElem.innerHTML = '<div class="empty-state">Carregando...</div>';
    
    const response = await fetch(`${API_URL}/apostas`);
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar');
    
    if (!data.apostas || data.apostas.length === 0) {
      listElem.innerHTML = '<div class="empty-state">Nenhuma aposta cadastrada.</div>';
      return;
    }
    
    listElem.innerHTML = '';
    data.apostas.forEach(aposta => {
      const item = document.createElement('div');
      item.className = 'aposta-item';
      item.innerHTML = `
        <div class="aposta-info">
          <div class="aposta-field">
            <span class="label">ID</span>
            <span class="value">#${aposta.idAposta || aposta.id}</span>
          </div>
          <div class="aposta-field">
            <span class="label">Apostador</span>
            <span class="value">${aposta.idApostador}</span>
          </div>
          <div class="aposta-field">
            <span class="label">Valor</span>
            <span class="value" style="color: var(--green)">R$ ${aposta.valor.toFixed(2)}</span>
          </div>
          <div class="aposta-field">
            <span class="label">Luta</span>
            <span class="value">${aposta.idLuta}</span>
          </div>
        </div>
      `;
      listElem.appendChild(item);
    });
    
    showToast('Apostas atualizadas', 'success');
  } catch (error) {
    listElem.innerHTML = `<div class="empty-state" style="color: var(--red)">Erro: ${error.message}</div>`;
    showToast('Erro ao carregar apostas', 'error');
  } finally {
    btnRefresh.disabled = false;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadPublicKey();
  loadApostas();
});
