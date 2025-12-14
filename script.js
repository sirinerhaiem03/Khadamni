function toArray(str) {
    return str.split(",").map(Number);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

function predictClass() {
    const result = document.getElementById('class_result');
    result.innerHTML = '<div class="job-item"><strong>✅ Offre Légitime</strong><p>Probabilité: 92%</p></div>';
}

function recommendLocation() {
    const result = document.getElementById('cluster_result');
    result.innerHTML = '<div class="job-item"><strong>Cluster: Île-de-France</strong><p>150 offres trouvées</p></div>';
}

function predictSalary() {
    const experience = document.getElementById('experience').value;
    const result = document.getElementById('reg_result');
    const estimatedSalary = 30000 + (parseInt(experience) * 2500);
    result.innerHTML = `<div class="job-item"><strong>💰 Salaire Estimé</strong><p>${estimatedSalary.toLocaleString('fr-FR')} €</p></div>`;
}

function recommendJobs() {
    const result = document.getElementById('reco_result');
    result.innerHTML = '<div class="job-item"><strong>Data Scientist - Tech Corp</strong><p>Paris - 55,000 €</p></div>';
}

// Sample jobs data (replace by API later)
const JOBS = [
    { id:1, title:'Data Scientist', company:'Tech Corp', location:'Paris', type:'Full-time', salary:55000, tags:['Python','ML','SQL'], img:'images/formation8DATA_science.jpg', desc:'Responsable des modèles ML, collecte et pipeline.' },
    { id:2, title:'Machine Learning Engineer', company:'HealthAI', location:'Remote', type:'Remote', salary:65000, tags:['TensorFlow','Docker'], img:'images/Must-Have-Machine-Learning-Engineer-Skills.webp', desc:'Déploiement de modèles pour produits santé.' },
    { id:3, title:'Data Analyst', company:'Finance Lab', location:'Lyon', type:'Part-time', salary:42000, tags:['SQL','PowerBI'], img:'images/images.jpg', desc:'Analyses financières et reporting.' },
    { id:4, title:'AI Product Manager', company:'Startup X', location:'Marseille', type:'CDI', salary:70000, tags:['Product','ML'], img:'images/AI-Product-Management.jpg', desc:'Pilotage produit IA.' },
    { id:5, title:'Junior Data Scientist', company:'DataStart', location:'Paris', type:'Full-time', salary:38000, tags:['Python','Pandas'], img:'images/maxresdefault.jpg', desc:'Apprentissage et support data.' },
    { id:6, title:'Data Management Specialist', company:'DeepLab', location:'Remote', type:'Remote', salary:90000, tags:['Research','PyTorch'], img:'images/screenshot.png', desc:'Recherche avancée ML.' },
    { id:7, title:'BI Developer', company:'InsightCo', location:'Lyon', type:'Full-time', salary:48000, tags:['SQL','ETL'], img:'images/bi-developer-datascientest-1024x512.png', desc:'Conception dashboards.' },
    { id: 8,title: 'Software Engineer',company: 'Innovatech',location: 'Remote', type: 'Full-time',salary: 60000,tags: ['JavaScript', 'React', 'Node.js'],  img: 'images/how-to-be-a-software-engineer.jpg', desc: 'Développement d’applications web modernes, conception backend et intégration API.'
}

];

const PAGE_SIZE = 6;
let currentPage = 1;
let SHOW_ALL = false;

// --- Job persistence helpers (recruiter posts saved in localStorage) ---
function getNextJobId() {
    return JOBS.reduce((m,j)=>Math.max(m, j.id || 0), 0) + 1;
}

function loadSavedJobs() {
    try {
        const saved = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        if (!Array.isArray(saved) || saved.length === 0) return;
        // ensure each saved job has an id and the same structure
        const maxId = JOBS.reduce((m,j)=>Math.max(m, j.id || 0), 0);
        saved.forEach((s, i) => {
            if (!s.id) s.id = maxId + i + 1;
            // insert saved jobs at the front so they're shown first
            JOBS.unshift(s);
        });
    } catch (e) { console.warn('Failed to load saved jobs', e); }
}

function saveJobToStorage(job) {
    try {
        const arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        arr.push(job);
        localStorage.setItem('kh_jobs', JSON.stringify(arr));
        // add to runtime list so UI updates immediately
        JOBS.unshift(job);
    } catch (e) { console.error('Failed to save job', e); }
}

function deleteSavedJob(id) {
    try {
        let arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        arr = arr.filter(j => j.id !== id);
        localStorage.setItem('kh_jobs', JSON.stringify(arr));
        const idx = JOBS.findIndex(j => j.id === id);
        if (idx !== -1) JOBS.splice(idx, 1);
        // update UI if present
        const manageList = document.getElementById('manageJobsList');
        if (manageList) renderManageJobs();
        renderJobs(1);
    } catch (e) { console.error(e); }
}

// Edit saved job (simple prompt-based editor)
function editSavedJob(id) {
    try {
        let arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        const idx = arr.findIndex(j => j.id === id);
        if (idx === -1) { alert('Offre introuvable.'); return; }
        const job = arr[idx];
        const title = prompt('Titre', job.title) || job.title;
        const company = prompt('Entreprise', job.company) || job.company;
        const location = prompt('Localisation', job.location) || job.location;
        const salary = parseInt(prompt('Salaire', job.salary) || job.salary) || job.salary;
        const tags = (prompt('Tags (séparés par ,)', (job.tags||[]).join(',')) || (job.tags||[]).join(',')).split(',').map(s=>s.trim()).filter(Boolean);
        const desc = prompt('Description', job.desc) || job.desc;
        // update
        job.title = title; job.company = company; job.location = location; job.salary = salary; job.tags = tags; job.desc = desc;
        arr[idx] = job;
        localStorage.setItem('kh_jobs', JSON.stringify(arr));
        // update runtime JOBS
        const rIdx = JOBS.findIndex(j=>j.id===id);
        if (rIdx !== -1) JOBS[rIdx] = job;
        renderManageJobs();
        renderJobs(1);
        alert('Offre mise à jour.');
    } catch(e) { console.error(e); alert('Erreur lors de la modification'); }
}

// --- Applicants handling ---
function applyJob(id) {
    const job = JOBS.find(j=>j.id===id);
    if (!job) { alert('Offre introuvable'); return; }
    
    // Open apply modal
    openApplyModal(id, job);
}

function openApplyModal(jobId, job) {
    const modal = document.getElementById('applyModal');
    const form = document.getElementById('applyForm');
    if (!modal || !form) return;
    
    // Get current user info
    const current = JSON.parse(localStorage.getItem('kh_current_user') || 'null');
    
    // Pre-fill form with user data
    document.getElementById('applyJobId').value = jobId;
    
    if (current && current.email) {
        // User is logged in - pre-fill with their data
        document.getElementById('applyEmail').value = current.email;
        document.getElementById('applyName').value = current.name || current.email.split('@')[0] || '';
    } else {
        // User not logged in - clear fields
        document.getElementById('applyEmail').value = '';
        document.getElementById('applyName').value = '';
    }
    
    // Clear other fields
    document.getElementById('applyPhone').value = '';
    document.getElementById('applyMessage').value = '';
    document.getElementById('applyLinkedIn').value = '';
    document.getElementById('applyCV').value = '';
    const fileNameEl = document.getElementById('fileName');
    if (fileNameEl) fileNameEl.textContent = 'Aucun fichier sélectionné';
    document.getElementById('applyTerms').checked = false;
    
    // Show job title in modal header if needed
    const modalHeader = modal.querySelector('.modal-header h2');
    if (modalHeader && job) {
        modalHeader.innerHTML = `<i class="fas fa-paper-plane"></i> Postuler : ${escapeHtml(job.title || 'Offre')}`;
    }
    
    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
}

function closeApplyModal() {
    const modal = document.getElementById('applyModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    }
}

function submitApplication() {
    const form = document.getElementById('applyForm');
    if (!form) return;
    
    // Check if terms are accepted
    if (!document.getElementById('applyTerms').checked) {
        alert('Veuillez accepter les conditions pour continuer.');
        return;
    }
    
    // Get form data
    const jobId = parseInt(document.getElementById('applyJobId').value);
    const name = document.getElementById('applyName').value.trim();
    const email = document.getElementById('applyEmail').value.trim();
    const phone = document.getElementById('applyPhone').value.trim();
    const message = document.getElementById('applyMessage').value.trim();
    const linkedin = document.getElementById('applyLinkedIn').value.trim();
    const cvFile = document.getElementById('applyCV').files[0];
    
    // Validation
    if (!name || !email) {
        alert('Veuillez remplir au moins le nom et l\'email.');
        return;
    }
    
    if (!message) {
        alert('Veuillez ajouter un message de motivation.');
        return;
    }
    
    // Create applicant object
    const applicant = {
        id: Date.now(),
        jobId: jobId,
        applicantEmail: email,
        applicantName: name,
        phone: phone || null,
        message: message,
        linkedin: linkedin || null,
        cvFileName: cvFile ? cvFile.name : null,
        date: new Date().toISOString(),
        status: 'applied'
    };
    
    // Save application
    const apps = JSON.parse(localStorage.getItem('kh_applicants') || '[]');
    apps.push(applicant);
    localStorage.setItem('kh_applicants', JSON.stringify(apps));
    
    // Update UI
    try { renderApplicantsForJob(jobId, 'modalApplicants'); } catch(e) {}
    try { renderManageJobs(); } catch(e) {}
    try { renderCandidatesJobs(); } catch(e) {}
    
    // Close modal
    closeApplyModal();
    
    // Show success message
    alert('✅ Votre candidature a été envoyée avec succès !');
}

function getApplicants(jobId) {
    try { return JSON.parse(localStorage.getItem('kh_applicants') || '[]').filter(a=>a.jobId===jobId); } catch(e) { return []; }
}

function renderApplicantsForJob(jobId, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const apps = getApplicants(jobId);
    if (!apps.length) { el.innerHTML = '<p class="placeholder">Aucun candidat pour cette offre.</p>'; return; }
    el.innerHTML = '<div class="applicants-list">' + apps.map(a=>`
        <div class="applicant-entry">
            <div>
                <div class="meta">${escapeHtml(a.applicantName)}</div>
                <div class="sub">${escapeHtml(a.applicantEmail)}</div>
            </div>
            <div style="text-align:right">
                <div class="sub">${new Date(a.date).toLocaleString()}</div>
            </div>
        </div>
    `).join('') + '</div>';
}

// Toggle applicants section (show/hide and render) for candidates page
function toggleApplicants(jobId, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (el.style.display && el.style.display !== 'none') {
        el.style.display = 'none';
        return;
    }
    el.style.display = 'block';
    try { renderApplicantsForJob(jobId, containerId); } catch(e) { el.innerHTML = '<p class="placeholder">Erreur lors du chargement des candidatures.</p>'; }
}

// Render analytics chart (uses Chart.js if available, otherwise draws a simple fallback on the canvas)
function renderApplicantsChart() {
    try {
        const canvas = document.getElementById('applicantsChart');
        if (!canvas) return;
        if (typeof loadSavedJobs === 'function') loadSavedJobs();
        const arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        const current = JSON.parse(localStorage.getItem('kh_current_user') || 'null');
        const owned = current && current.role === 'recruiter' ? arr.filter(j => j.owner === current.email) : arr;
        const labels = owned.map(j => (j.title || ('#'+j.id)).length > 30 ? (j.title || ('#'+j.id)).slice(0,27)+'...' : (j.title || ('#'+j.id)));
        const data = owned.map(j => getApplicants(j.id).length);
        const ctx = canvas.getContext('2d');
        
        // Color palette - different colors for each job
        const colorPalette = [
            'rgba(102, 126, 234, 0.8)',   // Primary blue
            'rgba(118, 75, 162, 0.8)',    // Secondary purple
            'rgba(72, 187, 120, 0.8)',    // Success green
            'rgba(237, 137, 54, 0.8)',    // Warning orange
            'rgba(66, 153, 225, 0.8)',    // Info blue
            'rgba(245, 101, 101, 0.8)',   // Danger red
            'rgba(139, 92, 246, 0.8)',    // Purple
            'rgba(236, 72, 153, 0.8)',    // Pink
            'rgba(34, 197, 94, 0.8)',     // Green
            'rgba(251, 191, 36, 0.8)',    // Yellow
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(168, 85, 247, 0.8)',    // Violet
            'rgba(20, 184, 166, 0.8)',    // Teal
            'rgba(249, 115, 22, 0.8)',    // Orange
            'rgba(239, 68, 68, 0.8)',     // Red
            'rgba(147, 51, 234, 0.8)',    // Indigo
            'rgba(219, 39, 119, 0.8)',    // Rose
            'rgba(16, 185, 129, 0.8)',    // Emerald
            'rgba(234, 179, 8, 0.8)',     // Amber
            'rgba(14, 165, 233, 0.8)'     // Sky
        ];
        
        // Border colors (darker versions)
        const borderColorPalette = [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(72, 187, 120, 1)',
            'rgba(237, 137, 54, 1)',
            'rgba(66, 153, 225, 1)',
            'rgba(245, 101, 101, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(20, 184, 166, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(147, 51, 234, 1)',
            'rgba(219, 39, 119, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(14, 165, 233, 1)'
        ];
        
        // Generate background colors array - one color per job
        const backgroundColorArray = data.map((_, index) => {
            return colorPalette[index % colorPalette.length];
        });
        
        // Generate border colors array
        const borderColorArray = data.map((_, index) => {
            return borderColorPalette[index % borderColorPalette.length];
        });
        
        // If Chart.js is present, use it
        if (typeof Chart !== 'undefined') {
            if (window._applicantsChart) {
                window._applicantsChart.data.labels = labels;
                window._applicantsChart.data.datasets[0].data = data;
                window._applicantsChart.data.datasets[0].backgroundColor = backgroundColorArray;
                window._applicantsChart.data.datasets[0].borderColor = borderColorArray;
                window._applicantsChart.update();
                return;
            }
            window._applicantsChart = new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels, 
                    datasets: [{ 
                        label: 'Candidatures', 
                        data, 
                        backgroundColor: backgroundColorArray,
                        borderColor: borderColorArray,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return 'Candidatures: ' + context.parsed.y;
                                }
                            }
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true, 
                            ticks: { 
                                precision: 0,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            },
                            grid: {
                                color: 'rgba(102, 126, 234, 0.1)',
                                lineWidth: 1
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 11,
                                    weight: '600'
                                },
                                maxRotation: 45,
                                minRotation: 0
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
            return;
        }
        // Fallback: draw a simple bar chart directly on canvas
        // Respect container size (chart-box) when drawing fallback
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(480, Math.round(rect.width || canvas.parentElement.clientWidth || 600));
        const h = Math.max(180, Math.round(rect.height || 240));
        canvas.width = w * (window.devicePixelRatio || 1);
        canvas.height = h * (window.devicePixelRatio || 1);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        ctx.clearRect(0,0,w,h);
        // background
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
        if (!labels.length) {
            ctx.fillStyle = 'var(--text-light)'; ctx.font = '14px sans-serif';
            ctx.fillText('Aucune offre pour afficher.', 12, 30);
            return;
        }
        const max = Math.max(1, ...data);
        const left = 60; const bottom = h - 40; const availW = w - left - 20;
        const gap = 12; const barW = Math.max(18, Math.floor((availW - (labels.length-1)*gap) / labels.length));
        // Y grid lines
        ctx.fillStyle = 'var(--text-light)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
        for (let i=0;i<=4;i++){
            const val = Math.round(max * (i/4));
            const y = bottom - (i/4)*(bottom-60);
            ctx.fillText(String(val), left-8, y+4);
            ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(w-12, y); ctx.stroke();
        }
        // Color palette for fallback canvas
        const fallbackColors = [
            'rgba(102, 126, 234, 0.85)',   // Primary blue
            'rgba(118, 75, 162, 0.85)',    // Secondary purple
            'rgba(72, 187, 120, 0.85)',    // Success green
            'rgba(237, 137, 54, 0.85)',    // Warning orange
            'rgba(66, 153, 225, 0.85)',    // Info blue
            'rgba(245, 101, 101, 0.85)',   // Danger red
            'rgba(139, 92, 246, 0.85)',    // Purple
            'rgba(236, 72, 153, 0.85)',    // Pink
            'rgba(34, 197, 94, 0.85)',     // Green
            'rgba(251, 191, 36, 0.85)',    // Yellow
            'rgba(59, 130, 246, 0.85)',   // Blue
            'rgba(168, 85, 247, 0.85)',    // Violet
            'rgba(20, 184, 166, 0.85)',    // Teal
            'rgba(249, 115, 22, 0.85)',    // Orange
            'rgba(239, 68, 68, 0.85)',     // Red
            'rgba(147, 51, 234, 0.85)',    // Indigo
            'rgba(219, 39, 119, 0.85)',    // Rose
            'rgba(16, 185, 129, 0.85)',    // Emerald
            'rgba(234, 179, 8, 0.85)',     // Amber
            'rgba(14, 165, 233, 0.85)'     // Sky
        ];
        
        labels.forEach((lab,i)=>{
            const x = left + i*(barW+gap);
            const barH = Math.round((data[i]/max)*(bottom-60));
            const y = bottom - barH;
            // Use different color for each bar
            ctx.fillStyle = fallbackColors[i % fallbackColors.length];
            ctx.fillRect(x, y, barW, barH);
            // Add border
            ctx.strokeStyle = fallbackColors[i % fallbackColors.length].replace('0.85', '1');
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barW, barH);
            // Value text
            ctx.fillStyle = 'var(--text-dark)'; 
            ctx.font = 'bold 12px sans-serif'; 
            ctx.textAlign = 'center';
            ctx.fillText(String(data[i]), x + barW/2, y - 6);
            // Label
            ctx.save(); 
            ctx.translate(x + barW/2, bottom + 14); 
            ctx.rotate(-0.5); 
            ctx.fillStyle='var(--text-light)'; 
            ctx.font = '11px sans-serif';
            ctx.fillText(lab, 0, 0); 
            ctx.restore();
        });
    } catch(e) { console.warn('renderApplicantsChart', e); }
}

function renderManageJobs() {
    const listEl = document.getElementById('manageJobsList');
    if (!listEl) return;
    const arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
    if (!arr.length) { 
        listEl.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty">
                    <div class="empty-state">
                        <i class="fas fa-briefcase"></i>
                        <h3>Aucune offre créée</h3>
                        <p>Commencez par créer votre première offre d'emploi</p>
                        <a href="post_job.html" class="btn-create-job">
                            <i class="fas fa-plus"></i> Créer une offre
                        </a>
                    </div>
                </td>
            </tr>
        `; 
        return; 
    }
    
    listEl.innerHTML = arr.map((j, index) => {
        const applicants = getApplicants(j.id);
        const applicantsCount = applicants.length;
        const badgeClass = j.type === 'Full-time' ? 'badge-full' : 
                          j.type === 'Remote' ? 'badge-remote' : 
                          j.type === 'Part-time' ? 'badge-part' : 'badge-cdi';
        
        return `
            <tr class="table-row" data-index="${index}">
                <td>
                    <div class="table-cell-content">
                        <div class="job-title-cell">
                            <strong>${escapeHtml(j.title || 'Sans titre')}</strong>
                            ${j.tags && j.tags.length > 0 ? `
                                <div class="job-tags-mini">
                                    ${j.tags.slice(0, 2).map(t => `<span class="tag-mini">${escapeHtml(t)}</span>`).join('')}
                                    ${j.tags.length > 2 ? `<span class="tag-more">+${j.tags.length - 2}</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="table-cell-content">
                        <div class="company-cell">
                            <i class="fas fa-building"></i>
                            <span>${escapeHtml(j.company || 'N/A')}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="table-cell-content">
                        <div class="location-cell">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${escapeHtml(j.location || 'Non spécifié')}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="table-cell-content">
                        <span class="job-badge ${badgeClass}">${escapeHtml(j.type || 'N/A')}</span>
                    </div>
                </td>
                <td>
                    <div class="table-cell-content">
                        <div class="salary-cell">
                            <i class="fas fa-euro-sign"></i>
                            <strong>${(j.salary || 0).toLocaleString('fr-FR')} €</strong>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="table-cell-content">
                        <div class="applicants-cell">
                            <i class="fas fa-users"></i>
                            <span class="applicants-count ${applicantsCount > 0 ? 'has-applicants' : ''}">${applicantsCount}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="table-cell-content">
                        <div class="action-buttons">
                            <button class="table-btn table-btn-view" onclick="openJobModal(${j.id})" title="Voir">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor"/>
                                </svg>
                            </button>
                            <button class="table-btn table-btn-edit" onclick="openEditModal(${j.id})" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="table-btn table-btn-delete" onclick="deleteSavedJob(${j.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Function to open edit modal with job data
function openEditModal(id) {
    try {
        const arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        const job = arr.find(j => j.id === id);
        if (!job) { alert('Offre introuvable.'); return; }
        
        const modal = document.getElementById('editJobModal');
        const form = document.getElementById('editJobForm');
        if (!modal || !form) { 
            // Fallback to old method
            editSavedJob(id);
            return;
        }
        
        form.id.value = job.id;
        form.title.value = job.title || '';
        form.company.value = job.company || '';
        form.location.value = job.location || '';
        form.type.value = job.type || 'Full-time';
        form.salary.value = job.salary || '';
        form.tags.value = (job.tags || []).join(', ');
        form.desc.value = job.desc || '';
        
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
    } catch(e) { 
        console.error(e);
        editSavedJob(id);
    }
}

function closeEditModal() {
    const modal = document.getElementById('editJobModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    }
}

function saveEditedJobFromModal() {
    try {
        const form = document.getElementById('editJobForm');
        if (!form) return;
        
        const id = parseInt(form.id.value);
        const title = form.title.value.trim();
        const company = form.company.value.trim();
        const location = form.location.value.trim();
        const type = form.type.value;
        const salary = parseInt(form.salary.value) || 0;
        const tags = form.tags.value.split(',').map(s => s.trim()).filter(Boolean);
        const desc = form.desc.value.trim();
        
        let arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        const idx = arr.findIndex(j => j.id === id);
        if (idx === -1) { alert('Offre introuvable.'); return; }
        
        arr[idx] = { ...arr[idx], title, company, location, type, salary, tags, desc };
        localStorage.setItem('kh_jobs', JSON.stringify(arr));
        
        // Update runtime JOBS
        const rIdx = JOBS.findIndex(j => j.id === id);
        if (rIdx !== -1) JOBS[rIdx] = arr[idx];
        
        renderManageJobs();
        renderJobs(1);
        closeEditModal();
        alert('Offre mise à jour avec succès.');
    } catch(e) { 
        console.error(e); 
        alert('Erreur lors de la modification'); 
    }
}

// Render recruiter jobs list for candidates page (reusable)
function renderCandidatesJobs() {
    try {
        if (typeof loadSavedJobs === 'function') loadSavedJobs();
        const arr = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        const listEl = document.getElementById('candidatesJobsList');
        if (!listEl) return;
        const current = JSON.parse(localStorage.getItem('kh_current_user') || 'null');
        const owned = current && current.role === 'recruiter' ? arr.filter(j => j.owner === current.email) : arr;
        
        if (!owned.length) {
            listEl.innerHTML = `
                <div class="empty-candidates-state">
                    <div class="empty-icon"><i class="fas fa-briefcase"></i></div>
                    <h3>Aucune offre publiée</h3>
                    <p>Commencez par créer votre première offre pour recevoir des candidatures</p>
                    <a href="post_job.html" class="btn-create-offer">
                        <i class="fas fa-plus"></i> Créer une offre
                    </a>
                </div>
            `;
            return;
        }
        
        listEl.innerHTML = owned.map(j => {
            const applicants = getApplicants(j.id);
            const applicantsCount = applicants.length;
            const badgeClass = j.type === 'Full-time' ? 'badge-full' : 
                              j.type === 'Remote' ? 'badge-remote' : 
                              j.type === 'Part-time' ? 'badge-part' : 'badge-cdi';
            const isExpanded = false;
            
            return `
                <div class="candidate-job-card">
                    <div class="job-card-header">
                        <div class="job-card-main">
                            <div class="job-title-section">
                                <h3 class="job-title-main">${escapeHtml(j.title || 'Sans titre')}</h3>
                                <div class="job-meta-info">
                                    <span class="job-company-name">
                                        <i class="fas fa-building"></i>
                                        ${escapeHtml(j.company || 'N/A')}
                                    </span>
                                    <span class="job-location-name">
                                        <i class="fas fa-map-marker-alt"></i>
                                        ${escapeHtml(j.location || 'Non spécifié')}
                                    </span>
                                    <span class="job-badge ${badgeClass}">${escapeHtml(j.type || 'N/A')}</span>
                                </div>
                                ${j.tags && j.tags.length > 0 ? `
                                    <div class="job-tags-row">
                                        ${j.tags.slice(0, 4).map(t => `<span class="tag-small">${escapeHtml(t)}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="job-stats-section">
                                <div class="applicant-stat-card">
                                    <div class="stat-icon-small">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="stat-content-small">
                                        <div class="stat-number">${applicantsCount}</div>
                                        <div class="stat-label-small">Candidatures</div>
                                    </div>
                                </div>
                                <div class="salary-display">
                                    <i class="fas fa-euro-sign"></i>
                                    <span>${(j.salary || 0).toLocaleString('fr-FR')} €</span>
                                </div>
                            </div>
                        </div>
                        <div class="job-card-actions">
                            <button class="action-btn action-view" onclick="openJobModal(${j.id})" title="Voir l'offre">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor"/>
                                </svg>
                                <span>Voir</span>
                            </button>
                            <button class="action-btn action-manage" onclick="window.location.href='manage_jobs.html'" title="Gérer">
                                <i class="fas fa-cog"></i>
                                <span>Gérer</span>
                            </button>
                            <button class="action-btn action-candidates ${applicantsCount > 0 ? 'has-candidates' : ''}" 
                                    onclick="toggleApplicants(${j.id}, 'applicants-${j.id}')" 
                                    title="Voir candidats">
                                <i class="fas fa-user-friends"></i>
                                <span>Candidats</span>
                                ${applicantsCount > 0 ? `<span class="badge-count">${applicantsCount}</span>` : ''}
                            </button>
                        </div>
                    </div>
                    
                    <div id="applicants-${j.id}" class="applicants-section" style="display:none;">
                        <div class="applicants-header">
                            <h4><i class="fas fa-users"></i> Candidatures (${applicantsCount})</h4>
                        </div>
                        <div class="applicants-table-container">
                            ${applicantsCount > 0 ? `
                                <table class="applicants-table">
                                    <thead>
                                        <tr>
                                            <th><i class="fas fa-user"></i> Candidat</th>
                                            <th><i class="fas fa-envelope"></i> Email</th>
                                            <th><i class="fas fa-calendar"></i> Date</th>
                                            <th><i class="fas fa-cog"></i> Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${applicants.map(a => `
                                            <tr>
                                                <td>
                                                    <div class="candidate-name-cell">
                                                        <div class="candidate-avatar">
                                                            <i class="fas fa-user"></i>
                                                        </div>
                                                        <span class="candidate-name">${escapeHtml(a.applicantName || 'N/A')}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="candidate-email-cell">
                                                        <i class="fas fa-envelope"></i>
                                                        <span>${escapeHtml(a.applicantEmail || 'N/A')}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="candidate-date-cell">
                                                        <div class="date-info">
                                                            <i class="fas fa-clock"></i>
                                                            <div>
                                                                <span>${new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                <small>${new Date(a.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small>
                                                            </div>
                                                        </div>
                                                        <button class="candidate-btn-view-inline" onclick="viewCandidateProfile(${a.id})" title="Voir détails">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor"/>
                                                            </svg>
                                                            <span>Voir</span>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="candidate-actions">
                                                        <button class="candidate-btn candidate-btn-contact" onclick="contactCandidate('${escapeHtml(a.applicantEmail)}')" title="Contacter">
                                                            <i class="fas fa-envelope"></i>
                                                            <span>Contacter</span>
                                                        </button>
                                                        <button class="candidate-btn candidate-btn-status" onclick="changeCandidateStatus(${a.id})" title="Changer statut">
                                                            <i class="fas fa-check-circle"></i>
                                                            <span>Statut</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : `
                                <div class="no-applicants">
                                    <i class="fas fa-user-slash"></i>
                                    <p>Aucune candidature pour cette offre</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) { console.warn('renderCandidatesJobs error', e); }
}

// Helper functions for candidate actions
function viewCandidateProfile(applicantId) {
    try {
        const applicants = JSON.parse(localStorage.getItem('kh_applicants') || '[]');
        const applicant = applicants.find(a => a.id === applicantId);
        
        if (!applicant) {
            alert('Candidat introuvable.');
            return;
        }
        
        // Find the job for this applicant
        const jobs = JSON.parse(localStorage.getItem('kh_jobs') || '[]');
        const job = jobs.find(j => j.id === applicant.jobId);
        
        openCandidateDetailModal(applicant, job);
    } catch(e) {
        console.error('Error viewing candidate profile:', e);
        alert('Erreur lors du chargement des détails du candidat.');
    }
}

function openCandidateDetailModal(applicant, job) {
    const modal = document.getElementById('candidateDetailModal');
    const content = document.getElementById('candidateDetailContent');
    const contactBtn = document.getElementById('btnContactCandidate');
    
    if (!modal || !content) return;
    
    // Format date
    const applyDate = new Date(applicant.date);
    const formattedDate = applyDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = applyDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Build content HTML
    content.innerHTML = `
        <div class="candidate-detail-header">
            <div class="candidate-avatar-large">
                <i class="fas fa-user"></i>
            </div>
            <div class="candidate-header-info">
                <h3>${escapeHtml(applicant.applicantName || 'N/A')}</h3>
                <p class="candidate-email-display">
                    <i class="fas fa-envelope"></i>
                    ${escapeHtml(applicant.applicantEmail || 'N/A')}
                </p>
                ${job ? `
                    <p class="candidate-job-applied">
                        <i class="fas fa-briefcase"></i>
                        Candidature pour : <strong>${escapeHtml(job.title || 'N/A')}</strong>
                    </p>
                ` : ''}
            </div>
        </div>
        
        <div class="candidate-detail-sections">
            <div class="detail-section">
                <div class="detail-section-header">
                    <i class="fas fa-info-circle"></i>
                    <h4>Informations personnelles</h4>
                </div>
                <div class="detail-section-content">
                    <div class="detail-item">
                        <div class="detail-label">
                            <i class="fas fa-user"></i>
                            <span>Nom complet</span>
                        </div>
                        <div class="detail-value">${escapeHtml(applicant.applicantName || 'Non spécifié')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">
                            <i class="fas fa-envelope"></i>
                            <span>Email</span>
                        </div>
                        <div class="detail-value">
                            <a href="mailto:${escapeHtml(applicant.applicantEmail)}">${escapeHtml(applicant.applicantEmail || 'N/A')}</a>
                        </div>
                    </div>
                    ${applicant.phone ? `
                        <div class="detail-item">
                            <div class="detail-label">
                                <i class="fas fa-phone"></i>
                                <span>Téléphone</span>
                            </div>
                            <div class="detail-value">
                                <a href="tel:${escapeHtml(applicant.phone)}">${escapeHtml(applicant.phone)}</a>
                            </div>
                        </div>
                    ` : ''}
                    ${applicant.linkedin ? `
                        <div class="detail-item">
                            <div class="detail-label">
                                <i class="fab fa-linkedin"></i>
                                <span>LinkedIn</span>
                            </div>
                            <div class="detail-value">
                                <a href="${escapeHtml(applicant.linkedin)}" target="_blank" rel="noopener">
                                    ${escapeHtml(applicant.linkedin)}
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${applicant.message ? `
                <div class="detail-section">
                    <div class="detail-section-header">
                        <i class="fas fa-file-alt"></i>
                        <h4>Message de motivation</h4>
                    </div>
                    <div class="detail-section-content">
                        <div class="motivation-message">
                            ${escapeHtml(applicant.message).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${applicant.cvFileName ? `
                <div class="detail-section">
                    <div class="detail-section-header">
                        <i class="fas fa-file-pdf"></i>
                        <h4>CV</h4>
                    </div>
                    <div class="detail-section-content">
                        <div class="cv-file-display">
                            <i class="fas fa-file-pdf"></i>
                            <span>${escapeHtml(applicant.cvFileName)}</span>
                            <button class="btn-download-cv" onclick="downloadCV('${escapeHtml(applicant.cvFileName)}')" title="Télécharger le CV">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <div class="detail-section-header">
                    <i class="fas fa-calendar-alt"></i>
                    <h4>Informations de candidature</h4>
                </div>
                <div class="detail-section-content">
                    <div class="detail-item">
                        <div class="detail-label">
                            <i class="fas fa-calendar"></i>
                            <span>Date de candidature</span>
                        </div>
                        <div class="detail-value">${formattedDate} à ${formattedTime}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">
                            <i class="fas fa-info-circle"></i>
                            <span>Statut</span>
                        </div>
                        <div class="detail-value">
                            <span class="status-badge status-${applicant.status || 'applied'}">
                                ${applicant.status === 'applied' ? 'Candidature reçue' : 
                                  applicant.status === 'reviewed' ? 'En cours d\'examen' :
                                  applicant.status === 'accepted' ? 'Accepté' :
                                  applicant.status === 'rejected' ? 'Refusé' : 'Candidature reçue'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Store applicant email for contact button
    if (contactBtn && applicant.applicantEmail) {
        contactBtn.setAttribute('data-email', applicant.applicantEmail);
    }
    
    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
}

function closeCandidateDetailModal() {
    const modal = document.getElementById('candidateDetailModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    }
}

function contactCandidateFromModal() {
    const btn = document.getElementById('btnContactCandidate');
    const email = btn ? btn.getAttribute('data-email') : null;
    if (email) {
        window.location.href = 'mailto:' + email;
    } else {
        alert('Email non disponible');
    }
}

function downloadCV(fileName) {
    alert('Téléchargement du CV : ' + fileName + '\n(Fonctionnalité de téléchargement à implémenter)');
}

function contactCandidate(email) {
    window.location.href = 'mailto:' + email;
}

function changeCandidateStatus(applicantId) {
    alert('Changer le statut du candidat #' + applicantId);
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

const TYPE_BADGE = {
    'Full-time': 'badge-full',
    'Remote': 'badge-remote',
    'Part-time': 'badge-part',
    'CDI': 'badge-cdi'
};

function getFilters() {
    const qEl = document.getElementById('searchInput');
    const locEl = document.getElementById('filterLocation');
    const typeEl = document.getElementById('filterType');
    const sortEl = document.getElementById('sortBy');
    return {
        q: qEl ? String(qEl.value).trim().toLowerCase() : '',
        location: locEl ? String(locEl.value) : '',
        type: typeEl ? String(typeEl.value) : '',
        sort: sortEl ? String(sortEl.value) : ''
    };
}

function applyFilters(list) {
    const f = getFilters();
    let out = list.filter(j => {
        const matchQ = !f.q || (j.title + ' ' + j.company + ' ' + j.tags.join(' ')).toLowerCase().includes(f.q);
        const matchLoc = !f.location || j.location === f.location;
        const matchType = !f.type || j.type === f.type;
        return matchQ && matchLoc && matchType;
    });
    if (f.sort === 'salary_desc') out.sort((a,b)=>b.salary-a.salary);
    else if (f.sort === 'salary_asc') out.sort((a,b)=>a.salary-b.salary);
    else out.sort((a,b)=>b.id - a.id); // recent by id
    return out;
}

function toggleShowAll() {
    SHOW_ALL = !SHOW_ALL;
    const btn = document.getElementById('viewAllBtn');
    btn.classList.toggle('active', SHOW_ALL);
    btn.textContent = SHOW_ALL ? 'Voir moins' : 'Voir toutes';
    renderJobs(1);
}

function renderPagination(pages, current, total) {
    const pEl = document.getElementById('pagination');
    if (pages <= 1) { pEl.innerHTML = ''; return; }

    let html = '';
    // previous button
    html += `<button ${current===1? 'disabled':''} onclick="renderJobs(${current-1})"><i class="fas fa-chevron-left"></i></button>`;
    // pages window (max 7 buttons)
    const start = Math.max(1, current - 3);
    const end = Math.min(pages, start + 6);
    for (let i = start; i <= end; i++) {
        html += `<button ${i===current? 'disabled':''} onclick="renderJobs(${i})">${i}</button>`;
    }
    // next button
    html += `<button ${current===pages? 'disabled':''} onclick="renderJobs(${current+1})"><i class="fas fa-chevron-right"></i></button>`;
    html += `<div style="margin-left:12px; color:var(--text-light)">Résultats: ${total}</div>`;
    pEl.innerHTML = html;
}

function renderJobs(page = 1) {
    currentPage = page;
    const container = document.getElementById('jobsList');
    if (!container) return; // page doesn't have jobs list (avoid errors on analytics, candidates pages)
    const all = applyFilters(JOBS);
    const total = all.length;

    const pages = SHOW_ALL ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = SHOW_ALL ? 0 : (page - 1) * PAGE_SIZE;
    const slice = SHOW_ALL ? all : all.slice(start, start + PAGE_SIZE);

    container.innerHTML = slice.map(job => {
        const badgeClass = TYPE_BADGE[job.type] || 'badge-full';
        return `
        <article class="job-card" data-id="${job.id}">
            <div class="job-media">
                <img class="job-img" src="${job.img}" alt="${job.company}">
                <div class="salary-badge">${job.salary.toLocaleString('fr-FR')} €</div>
            </div>
            <div class="job-body">
                <div class="job-top">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company} — ${job.location}</p>
                    </div>
                    <div class="job-badge ${badgeClass}">${job.type}</div>
                </div>
                <div class="job-meta">
                    <div class="job-tags">${job.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
                    <div class="job-actions">
                        <button class="card-btn view" onclick="openJobModal(${job.id})">Voir</button>
                        <button class="card-btn apply" onclick="applyJob(${job.id})">Postuler</button>
                    </div>
                </div>
            </div>
        </article>`;
    }).join('');

    
    if (SHOW_ALL) {
        document.getElementById('pagination').innerHTML = `<div style="color:var(--text-light); text-align:center; margin-top:12px">Affichage de toutes les offres (${total})</div>`;
    } else {
        renderPagination(pages, page, total);
    }
}


function openJobModal(id) {
    const job = JOBS.find(j=>j.id===id);
    if (!job) return;
    const modal = document.getElementById('jobModal');
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="modal-header">
            <img class="logo-img" src="${job.img}" alt="${job.company}">
            <div class="meta">
                <h2>${job.title}</h2>
                <p>${job.company} · ${job.location} · <span style="font-weight:800">${job.type}</span></p>
            </div>
            <button class="modal-close" onclick="closeJobModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="modal-salary">Salaire estimé: ${job.salary.toLocaleString('fr-FR')} €</div>
            <p>${job.desc}</p>
            <div class="modal-tags">${job.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
            <div class="modal-actions">
                <button class="apply-cta" onclick="applyJob(${job.id})">Postuler</button>
                <button class="close-cta" onclick="closeJobModal()">Fermer</button>
            </div>
            <hr style="margin:12px 0" />
            <div>
                <h3>Candidats</h3>
                <div id="modalApplicants"></div>
            </div>
        </div>
    `;
    modal.setAttribute('aria-hidden','false');
    // render applicants for this job into the modal
    try { renderApplicantsForJob(id, 'modalApplicants'); } catch(e) { console.warn('No applicants renderer', e); }
}

function closeJobModal() {
    const modal = document.getElementById('jobModal');
    modal.setAttribute('aria-hidden','true');
}
document.addEventListener('DOMContentLoaded', () => {
    ['searchInput','filterLocation','filterType','sortBy'].forEach(id=>{
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', ()=> renderJobs(1));
        el.addEventListener('change', ()=> renderJobs(1));
    });
    // load saved recruiter jobs first so they appear in listings
    loadSavedJobs();
    renderJobs(1);
    
    renderManageJobs();
    // If analytics canvas exists, try to render chart after a short delay
    try {
        const tryChart = () => {
            const canvas = document.getElementById('applicantsChart');
            if (!canvas) return;
            if (typeof renderApplicantsChart === 'function') {
                if (typeof Chart === 'undefined') {
                    // Chart library not available yet, retry shortly
                    setTimeout(tryChart, 150);
                    return;
                }
                try { renderApplicantsChart(); } catch(e) { console.warn('renderApplicantsChart error', e); }
            }
        };
        setTimeout(tryChart, 120);
    } catch(e) {}
});


document.addEventListener('keydown', (e)=> { 
    if (e.key === 'Escape') {
        closeJobModal();
        closeApplyModal();
        closeCandidateDetailModal();
    }
});

// File upload handler for CV
document.addEventListener('DOMContentLoaded', () => {
    const cvInput = document.getElementById('applyCV');
    const fileName = document.getElementById('fileName');
    
    if (cvInput && fileName) {
        cvInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                fileName.style.color = 'var(--primary)';
            } else {
                fileName.textContent = 'Aucun fichier sélectionné';
                fileName.style.color = 'var(--text-light)';
            }
        });
    }
});


function saveUserToStorage(user) {
    const users = JSON.parse(localStorage.getItem('kh_users') || '[]');
    users.push(user);
    localStorage.setItem('kh_users', JSON.stringify(users));
}

function findUser(email, password) {
    const users = JSON.parse(localStorage.getItem('kh_users') || '[]');
    return users.find(u => u.email === email && u.password === password);
}

// Handle registration form (register.html)
document.addEventListener('DOMContentLoaded', ()=>{
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', (ev)=>{
            ev.preventDefault();
            const form = ev.target;
            const email = form.email.value.trim();
            const password = form.password.value;
            const confirm = form.confirm_password.value;
            const role = document.querySelector('input[name="role"]:checked')?.value || 'job_seeker';

            if (!email || !password) { alert('Please fill email and password.'); return; }
            if (password !== confirm) { alert('Passwords do not match'); return; }

            // Save user (overwrite if exists)
            const users = JSON.parse(localStorage.getItem('kh_users') || '[]').filter(u=>u.email !== email);
            users.push({ email, password, role });
            localStorage.setItem('kh_users', JSON.stringify(users));

            // After registration, redirect to sign-in (login) page
            alert('Compte créé avec succès. Veuillez vous connecter.');
            window.location.href = 'login.html';
        });
    }

    // Handle login form (login.html)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (ev)=>{
            ev.preventDefault();
            const form = ev.target;
            const email = document.getElementById('login_email')?.value || form.email?.value;
            const password = document.getElementById('login_password')?.value || form.password?.value;
            if (!email || !password) { alert('Please enter credentials'); return; }
            const user = findUser(email.trim(), password);
            if (!user) { alert('Invalid credentials (demo).'); return; }

            // simple session
            localStorage.setItem('kh_current_user', JSON.stringify({ email: user.email, role: user.role }));

            if (user.role === 'recruiter') window.location.href = 'recruiter_home.html';
            else window.location.href = 'index.html';
        });
    }
});

// Logout (deconnection)
function logout() {
    localStorage.removeItem('kh_current_user');
    // optionally keep users saved, just clear current session
    window.location.href = 'login.html';
}
