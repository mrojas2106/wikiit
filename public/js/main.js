// Wiki IT - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Confirmación para acciones destructivas
    const deleteForms = document.querySelectorAll('form[action*="delete"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('¿Estás seguro de que quieres realizar esta acción? Esta acción no se puede deshacer.')) {
                e.preventDefault();
            }
        });
    });

    // Mejora para textareas de contenido
    const contentTextareas = document.querySelectorAll('textarea[name="content"]');
    contentTextareas.forEach(textarea => {
        // Auto-expand textarea mientras se escribe
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Inicial height
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });

    // Búsqueda en tiempo real (opcional)
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 3 || this.value.length === 0) {
                    this.form.submit();
                }
            }, 500);
        });
    }

    // Mejora para selects de rol
    const roleSelects = document.querySelectorAll('select[name="role"]');
    roleSelects.forEach(select => {
        select.addEventListener('change', function() {
            this.form.submit();
        });
    });

    // Tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Popovers de Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    const popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Contador de caracteres para comentarios
    const commentTextarea = document.querySelector('textarea[name="content"]');
    if (commentTextarea) {
        const counter = document.createElement('div');
        counter.className = 'form-text text-end';
        counter.textContent = '0/1000 caracteres';
        commentTextarea.parentNode.appendChild(counter);

        commentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = `${length}/1000 caracteres`;
            
            if (length > 1000) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        });
    }

    // Smooth scroll para anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mejora para formularios de búsqueda
    const searchForms = document.querySelectorAll('form[action*="search"]');
    searchForms.forEach(form => {
        const input = form.querySelector('input[type="search"]');
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.submit();
            }
        });
    });

    // Funcionalidad de "Leer más" para artículos largos
    const articleContents = document.querySelectorAll('.article-content');
    articleContents.forEach(content => {
        const paragraphs = content.querySelectorAll('p');
        if (paragraphs.length > 3) {
            // Ocultar párrafos después del tercero
            for (let i = 3; i < paragraphs.length; i++) {
                paragraphs[i].style.display = 'none';
            }

            // Agregar botón "Leer más"
            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'btn btn-sm btn-outline-primary mt-2';
            readMoreBtn.textContent = 'Leer más';
            content.appendChild(readMoreBtn);

            readMoreBtn.addEventListener('click', function() {
                for (let i = 3; i < paragraphs.length; i++) {
                    paragraphs[i].style.display = 'block';
                }
                this.style.display = 'none';
            });
        }
    });

    // Highlight code blocks (si hay bloques de código)
    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightBlock(block);
    });

    // Notificaciones del sistema
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    };

    // Funcionalidad de favoritos (si se implementa)
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const articleId = this.dataset.articleId;
            const isFavorited = this.classList.contains('text-warning');
            
            // Aquí iría la llamada AJAX para guardar el favorito
            fetch(`/articles/${articleId}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    favorite: !isFavorited
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.classList.toggle('text-warning');
                    this.classList.toggle('text-muted');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});

// Helper functions
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// API helpers
const api = {
    async get(url) {
        const response = await fetch(url);
        return await response.json();
    },
    
    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async put(url, data) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async delete(url) {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        return await response.json();
    }
};