(function () {
    'use strict';

    const dom = {
        testsTableBody: document.getElementById('testsTableBody'),
        btnLogout: document.getElementById('btnLogout'),
        
        btnCreateTest: document.getElementById('btnCreateTest'),
        testModal: document.getElementById('testModal'),
        testForm: document.getElementById('testForm'),
        btnCancelTest: document.getElementById('btnCancelTest'),
        
        questionModal: document.getElementById('questionModal'),
        questionForm: document.getElementById('questionForm'),
        btnCancelQuestion: document.getElementById('btnCancelQuestion'),
        csvFileInput: document.getElementById('csvFileInput'),

        // Student Progress elements
        btnTabTests: document.getElementById('btnTabTests'),
        btnTabProgress: document.getElementById('btnTabProgress'),
        tabTests: document.getElementById('tabTests'),
        tabProgress: document.getElementById('tabProgress'),
        progressTableBody: document.getElementById('progressTableBody'),
        btnRefreshProgress: document.getElementById('btnRefreshProgress'),
        
        // Access Management elements
        accessModal: document.getElementById('accessModal'),
        accessTableBody: document.getElementById('accessTableBody'),
        btnCloseAccess: document.getElementById('btnCloseAccess'),
        btnLockAll: document.getElementById('btnLockAll'),
        btnUnlockAll: document.getElementById('btnUnlockAll'),

        // Image Manager elements
        imagesModal: document.getElementById('imagesModal'),
        imagesModalTitle: document.getElementById('imagesModalTitle'),
        imagesTableBody: document.getElementById('imagesTableBody'),
        btnCloseImages: document.getElementById('btnCloseImages'),
        chkOnlyImageQuestions: document.getElementById('chkOnlyImageQuestions'),
        imageStatsCount: document.getElementById('imageStatsCount'),
        btnSaveAllImages: document.getElementById('btnSaveAllImages'),

        // CSV / Question Editor elements
        editCsvModal: document.getElementById('editCsvModal'),
        editCsvModalTitle: document.getElementById('editCsvModalTitle'),
        btnCloseEditCsv: document.getElementById('btnCloseEditCsv'),
        btnTabCsvTable: document.getElementById('btnTabCsvTable'),
        btnTabCsvRaw: document.getElementById('btnTabCsvRaw'),
        csvTableView: document.getElementById('csvTableView'),
        csvRawView: document.getElementById('csvRawView'),
        csvTableBody: document.getElementById('csvTableBody'),
        rawCsvTextArea: document.getElementById('rawCsvTextArea'),
        csvQuestionCountLabel: document.getElementById('csvQuestionCountLabel'),
        btnSaveCsvChanges: document.getElementById('btnSaveCsvChanges'),
        btnExportCurrentCsv: document.getElementById('btnExportCurrentCsv'),

        // Single Question Editor elements
        singleQuestionModal: document.getElementById('singleQuestionModal'),
        singleQuestionModalTitle: document.getElementById('singleQuestionModalTitle'),
        singleQuestionForm: document.getElementById('singleQuestionForm'),
        btnCloseSingleQuestion: document.getElementById('btnCloseSingleQuestion'),
        btnCancelSingleQuestion: document.getElementById('btnCancelSingleQuestion'),
        sqModule: document.getElementById('sqModule'),
        sqQNum: document.getElementById('sqQNum'),
        sqType: document.getElementById('sqType'),
        sqImageUrl: document.getElementById('sqImageUrl'),
        sqPrompt: document.getElementById('sqPrompt'),
        sqPassageGroup: document.getElementById('sqPassageGroup'),
        sqPassage: document.getElementById('sqPassage'),
        sqMcqSection: document.getElementById('sqMcqSection'),
        sqOptA: document.getElementById('sqOptA'),
        sqOptB: document.getElementById('sqOptB'),
        sqOptC: document.getElementById('sqOptC'),
        sqOptD: document.getElementById('sqOptD'),
        sqCorrectIndex: document.getElementById('sqCorrectIndex'),
        sqSprSection: document.getElementById('sqSprSection'),
        sqCorrectText: document.getElementById('sqCorrectText')
    };
    
    let currentUploadTestId = null;

    function decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    async function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return false;
        }

        // Try decoding token to check role
        const payload = decodeJWT(token);
        if (!payload) {
            window.location.href = '/login';
            return false;
        }
        
        if (payload.role !== 'admin') {
            alert('Access denied. Admin only.');
            window.location.href = '/dashboard';
            return false;
        }
        
        return token;
    }

    async function loadTests() {
        const token = await checkAuth();
        if (!token) return;

        try {
            const res = await fetch('/api/tests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load tests');
            const tests = await res.json();
            
            dom.testsTableBody.innerHTML = '';
            tests.forEach(t => {
                const tr = document.createElement('tr');
                let typeLabel = 'Reading & Writing';
                if (t.type === 'math') typeLabel = 'Math';
                if (t.type === 'full') typeLabel = 'Full Mock Test';

                tr.innerHTML = `
                    <td>${t.id}</td>
                    <td><strong>${t.title}</strong></td>
                    <td>${typeLabel}</td>
                    <td>${new Date(t.created_at).toLocaleDateString()}</td>
                    <td style="white-space: nowrap;">
                        <div class="action-buttons-group">
                            <button class="btn-admin btn-add-q" style="background: #10b981; padding: 6px 12px; font-size: 13px;" data-id="${t.id}" data-type="${t.type}">
                                Add Question
                            </button>
                            <button class="btn-admin btn-edit-csv" style="background: #6366f1; padding: 6px 12px; font-size: 13px;" data-id="${t.id}" data-title="${t.title}">
                                📝 Edit CSV
                            </button>
                            <button class="btn-admin btn-import-csv" style="background: #8b5cf6; padding: 6px 12px; font-size: 13px;" data-id="${t.id}">
                                Drop/Import CSV
                            </button>
                            <button class="btn-admin btn-manage-images" style="background: #0284c7; padding: 6px 12px; font-size: 13px;" data-id="${t.id}" data-title="${t.title}">
                                🖼️ Images
                            </button>
                            <button class="btn-admin btn-manage-access" style="background: #eab308; padding: 6px 12px; font-size: 13px;" data-id="${t.id}">
                                Access
                            </button>
                            <button class="btn-admin btn-practice-toggle" style="background: ${t.allow_practice ? '#10b981' : '#6b7280'}; padding: 6px 12px; font-size: 13px;" data-id="${t.id}" data-allow="${t.allow_practice}">
                                Practice: ${t.allow_practice ? 'ON' : 'OFF'}
                            </button>
                            <button class="btn-admin btn-delete-test" style="background: #ef4444; padding: 6px 12px; font-size: 13px;" data-id="${t.id}">
                                Delete
                            </button>
                        </div>
                    </td>
                `;
                dom.testsTableBody.appendChild(tr);
            });

            // Bind Practice Toggle buttons
            document.querySelectorAll('.btn-practice-toggle').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    const allowPractice = e.currentTarget.getAttribute('data-allow') === '1' || e.currentTarget.getAttribute('data-allow') === 'true';
                    const newAllow = !allowPractice;
                    
                    try {
                        const res = await fetch(`/api/admin/tests/${testId}/practice`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ allow_practice: newAllow })
                        });
                        
                        if (res.ok) {
                            loadTests();
                        } else {
                            alert('Failed to update Practice Mode setting');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Error updating Practice Mode');
                    }
                });
            });

            // Bind Add Question buttons
            document.querySelectorAll('.btn-add-q').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    const testType = e.currentTarget.getAttribute('data-type');
                    openQuestionModal(testId, testType);
                });
            });

            document.querySelectorAll('.btn-import-csv').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentUploadTestId = e.currentTarget.getAttribute('data-id');
                    dom.csvFileInput.click();
                });
                
                btn.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    btn.style.opacity = '0.7';
                    btn.style.outline = '2px dashed #fff';
                    btn.style.outlineOffset = '-2px';
                });
                
                btn.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    btn.style.opacity = '1';
                    btn.style.outline = 'none';
                });
                
                btn.addEventListener('drop', (e) => {
                    e.preventDefault();
                    btn.style.opacity = '1';
                    btn.style.outline = 'none';
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        currentUploadTestId = e.currentTarget.getAttribute('data-id');
                        dom.csvFileInput.files = e.dataTransfer.files;
                        dom.csvFileInput.dispatchEvent(new Event('change'));
                    }
                });
            });

            document.querySelectorAll('.btn-delete-test').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this test and all its questions?')) {
                        deleteTest(testId);
                    }
                });
            });

            document.querySelectorAll('.btn-manage-access').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    openAccessModal(testId);
                });
            });

            document.querySelectorAll('.btn-manage-images').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    const testTitle = e.currentTarget.getAttribute('data-title');
                    openImagesModal(testId, testTitle);
                });
            });

            document.querySelectorAll('.btn-edit-csv').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    const testTitle = e.currentTarget.getAttribute('data-title');
                    openEditCsvModal(testId, testTitle);
                });
            });
        } catch (err) {
            console.error(err);
            alert('Error loading tests');
        }
    }

    async function deleteTest(testId) {
        const token = await checkAuth();
        if (!token) return;

        try {
            const res = await fetch(`/api/admin/tests/${testId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                loadTests();
            } else {
                alert('Failed to delete test');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting test');
        }
    }

    // --- Modals ---
    dom.btnCreateTest.addEventListener('click', () => {
        dom.testForm.reset();
        dom.testModal.classList.remove('hidden');
    });

    dom.btnCancelTest.addEventListener('click', () => {
        dom.testModal.classList.add('hidden');
    });

    dom.testForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = await checkAuth();
        const title = document.getElementById('testTitle').value;
        const type = document.getElementById('testType').value;

        try {
            const res = await fetch('/api/admin/tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, type })
            });
            if (res.ok) {
                dom.testModal.classList.add('hidden');
                loadTests();
            } else {
                alert('Failed to create test');
            }
        } catch (err) {
            console.error(err);
        }
    });

    function openQuestionModal(testId, type) {
        dom.questionForm.reset();
        document.getElementById('qTestId').value = testId;
        
        const passageGroup = document.getElementById('passageGroup');
        if (type === 'math') {
            passageGroup.style.display = 'none';
        } else {
            passageGroup.style.display = 'block';
        }
        
        dom.questionModal.classList.remove('hidden');
    }

    dom.btnCancelQuestion.addEventListener('click', () => {
        dom.questionModal.classList.add('hidden');
    });

    document.getElementById('qType').addEventListener('change', (e) => {
        const type = e.target.value;
        if (type === 'mcq') {
            document.getElementById('mcqOptionsGroup').classList.remove('hidden');
            document.getElementById('mcqCorrectGroup').classList.remove('hidden');
            document.getElementById('sprCorrectGroup').classList.add('hidden');
        } else {
            document.getElementById('mcqOptionsGroup').classList.add('hidden');
            document.getElementById('mcqCorrectGroup').classList.add('hidden');
            document.getElementById('sprCorrectGroup').classList.remove('hidden');
        }
    });

    dom.questionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const test_id = document.getElementById('qTestId').value;
        if (!test_id) {
            alert('Error: Test ID is missing.');
            return;
        }

        const token = await checkAuth();
        const module_num = document.getElementById('qModule').value;
        const qNumber = document.getElementById('qNumber').value;
        const passage = document.getElementById('qPassage').value;
        const qType = document.getElementById('qType').value;
        const imageUrl = document.getElementById('qImageUrl').value;
        const prompt = document.getElementById('qPrompt').value;
        
        let options = null;
        let correct_answer_index = null;
        let correct_answer_text = null;
        
        if (qType === 'mcq') {
            options = [
                document.getElementById('qOptA').value,
                document.getElementById('qOptB').value,
                document.getElementById('qOptC').value,
                document.getElementById('qOptD').value
            ];
            correct_answer_index = document.getElementById('qCorrect').value;
        } else {
            correct_answer_text = document.getElementById('qCorrectText').value;
        }

        try {
            const res = await fetch('/api/admin/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    test_id,
                    module: parseInt(module_num),
                    question_number: parseInt(qNumber),
                    passage,
                    image_url: imageUrl || null,
                    prompt,
                    question_type: qType,
                    options,
                    correct_answer_index,
                    correct_answer_text
                })
            });

            if (res.ok) {
                alert('Question added successfully!');
                // Reset partly for next question
                document.getElementById('qNumber').value = parseInt(qNumber) + 1;
                document.getElementById('qPrompt').value = '';
                document.getElementById('qOptA').value = '';
                document.getElementById('qOptB').value = '';
                document.getElementById('qOptC').value = '';
                document.getElementById('qOptD').value = '';
                document.getElementById('qCorrectText').value = '';
            } else {
                alert('Failed to save question');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // --- CSV Import ---
    dom.csvFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUploadTestId) return;

        const token = await checkAuth();
        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvData = event.target.result;
            const parsedQuestions = parseCSV(csvData);
            
            if (parsedQuestions.length === 0) {
                alert('No valid questions found in CSV.');
                return;
            }

            try {
                const res = await fetch(`/api/admin/tests/${currentUploadTestId}/questions/bulk`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ questions: parsedQuestions })
                });

                if (res.ok) {
                    alert(`Successfully imported ${parsedQuestions.length} questions!`);
                } else {
                    const err = await res.json();
                    alert('Import failed: ' + (err.message || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Error uploading CSV.');
            }
            
            // reset file input
            dom.csvFileInput.value = '';
            currentUploadTestId = null;
        };
        reader.readAsText(file);
    });

    function parseCSV(csv) {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        // Standardize line endings to \n
        const cleanCsv = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < cleanCsv.length; i++) {
            const char = cleanCsv[i];
            const nextChar = cleanCsv[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped double quote
                    currentField += '"';
                    i++; // skip next quote
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n' && !inQuotes) {
                // End of row
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }

        // Push last field/row if any
        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            rows.push(currentRow);
        }

        if (rows.length < 2) return [];

        const headers = rows[0].map(h => h.toLowerCase());
        const questions = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i];
            if (cols.length < headers.length) continue;

            const getCol = (name) => {
                const idx = headers.indexOf(name);
                return idx !== -1 ? cols[idx] : null;
            };

            const moduleNum = parseInt(getCol('module')) || 1;
            const qNum = parseInt(getCol('question_number'));
            const passage = getCol('passage') || null;
            const prompt = getCol('prompt') || '';
            const imageUrl = getCol('image_url') || null;
            const qType = getCol('question_type') || 'mcq';

            if (isNaN(qNum)) continue; // skip invalid rows

            let options = null;
            let correct_answer_index = null;
            let correct_answer_text = null;

            if (qType === 'mcq') {
                options = [
                    getCol('option_a') || '',
                    getCol('option_b') || '',
                    getCol('option_c') || '',
                    getCol('option_d') || ''
                ];
                // if correct_answer_index is present use it, else try correct_answer mapping A->0, etc.
                let ansIdx = parseInt(getCol('correct_answer_index'));
                if (isNaN(ansIdx)) {
                    const ansText = getCol('correct_answer') || getCol('correct_answer_text') || '';
                    ansIdx = ['A','B','C','D'].indexOf(ansText.toUpperCase());
                }
                correct_answer_index = isNaN(ansIdx) ? 0 : ansIdx;
            } else {
                correct_answer_text = getCol('correct_answer_text') || getCol('correct_answer') || '';
            }

            questions.push({
                module: moduleNum,
                question_number: qNum,
                passage: passage,
                prompt: prompt,
                options: options,
                correct_answer_index: correct_answer_index,
                image_url: imageUrl,
                question_type: qType,
                correct_answer_text: correct_answer_text,
                section: getCol('section') || null
            });
        }
        return questions;
    }

    dom.btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // --- Tab Switching ---
    dom.btnTabTests.addEventListener('click', () => {
        dom.btnTabTests.classList.add('active');
        dom.btnTabProgress.classList.remove('active');
        dom.tabTests.classList.add('active');
        dom.tabProgress.classList.remove('active');
    });

    dom.btnTabProgress.addEventListener('click', () => {
        dom.btnTabProgress.classList.add('active');
        dom.btnTabTests.classList.remove('active');
        dom.tabProgress.classList.add('active');
        dom.tabTests.classList.remove('active');
        loadStudentProgress();
    });

    // --- Access Management Logic ---
    let currentAccessTestId = null;

    async function openAccessModal(testId) {
        currentAccessTestId = testId;
        dom.accessModal.classList.remove('hidden');
        await loadAccessList();
    }

    async function loadAccessList() {
        if (!currentAccessTestId) return;
        const token = await checkAuth();
        try {
            const res = await fetch(`/api/admin/tests/${currentAccessTestId}/locks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load locks');
            const students = await res.json();
            
            dom.accessTableBody.innerHTML = '';
            students.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.id}</td>
                    <td>${s.email}</td>
                    <td style="text-align: right;">
                        <label class="toggle-switch">
                            <input type="checkbox" class="access-toggle" data-uid="${s.id}" ${s.is_locked ? '' : 'checked'}>
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                `;
                dom.accessTableBody.appendChild(tr);
            });

            // Bind toggle events
            document.querySelectorAll('.access-toggle').forEach(toggle => {
                toggle.addEventListener('change', async (e) => {
                    const uid = e.target.getAttribute('data-uid');
                    const isLocked = !e.target.checked;
                    await updateLocks([uid], isLocked);
                });
            });

        } catch (err) {
            console.error(err);
            alert('Failed to load access list');
        }
    }

    async function updateLocks(userIds, isLocked) {
        const token = await checkAuth();
        try {
            const res = await fetch(`/api/admin/tests/${currentAccessTestId}/locks`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userIds, is_locked: isLocked })
            });
            if (!res.ok) throw new Error('Failed to update lock');
        } catch (err) {
            console.error(err);
            alert('Failed to update access');
            // Revert UI by reloading
            loadAccessList();
        }
    }

    dom.btnCloseAccess.addEventListener('click', () => {
        dom.accessModal.classList.add('hidden');
        currentAccessTestId = null;
    });

    dom.btnLockAll.addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('.access-toggle');
        const userIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-uid'));
        if (userIds.length > 0) {
            checkboxes.forEach(cb => cb.checked = false); // UI update immediately
            await updateLocks(userIds, true);
        }
    });

    dom.btnUnlockAll.addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('.access-toggle');
        const userIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-uid'));
        if (userIds.length > 0) {
            checkboxes.forEach(cb => cb.checked = true); // UI update immediately
            await updateLocks(userIds, false);
        }
    });

    // --- Student Progress Logic ---
    dom.btnRefreshProgress.addEventListener('click', loadStudentProgress);

    // --- Load Student Progress ---
    async function loadStudentProgress() {
        const token = await checkAuth();
        if (!token) return;

        try {
            const res = await fetch('/api/admin/student-progress', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load student progress');
            const progressData = await res.json();
            
            dom.progressTableBody.innerHTML = '';
            progressData.forEach(p => {
                const tr = document.createElement('tr');
                
                let typeLabel = 'Reading & Writing';
                if (p.test_type === 'math') typeLabel = 'Math';
                if (p.test_type === 'full') typeLabel = 'Full Mock Test';

                const statusClass = p.completed ? 'status-completed' : 'status-progress';
                const statusText = p.completed ? 'Completed' : 'In Progress';
                const roleBadge = p.student_role === 'admin' 
                    ? ' <span style="background:#8b5cf6;color:white;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">ADMIN</span>' 
                    : '';

                tr.innerHTML = `
                    <td><strong>${p.student_name}</strong>${roleBadge}</td>
                    <td>${p.student_email}</td>
                    <td>${p.test_title}</td>
                    <td>${typeLabel}</td>
                    <td><strong style="color: #10b981; font-size: 15px;">${p.score !== null ? p.score : 0}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${new Date(p.updated_at).toLocaleString()}</td>
                `;
                dom.progressTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            alert('Error loading student progress');
        }
    }

    // --- Student Progress Filter ---
    const progressFilter = document.getElementById('progressFilter');
    if (progressFilter) {
        progressFilter.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = dom.progressTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // --- Image Manager Logic ---
    let currentTestQuestionsForImages = [];

    async function openImagesModal(testId, testTitle) {
        const token = await checkAuth();
        if (!token) return;

        dom.imagesModalTitle.textContent = `🖼️ Detect & Manage Images - ${testTitle}`;
        dom.imagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Loading questions...</td></tr>';
        dom.imagesModal.classList.remove('hidden');

        try {
            const res = await fetch(`/api/tests/${testId}/questions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load questions');
            const data = await res.json();
            currentTestQuestionsForImages = data.questions || [];
            renderImageQuestionsList();
        } catch (err) {
            console.error(err);
            alert('Error loading questions for image manager');
        }
    }

    function renderImageQuestionsList() {
        const onlyFilter = dom.chkOnlyImageQuestions.checked;
        dom.imagesTableBody.innerHTML = '';

        let detectedCount = 0;
        let renderedCount = 0;

        currentTestQuestionsForImages.forEach(q => {
            const promptText = q.prompt || '';
            const optionsText = typeof q.options === 'string' ? q.options : JSON.stringify(q.options || '');
            const hasImageTag = promptText.includes('[image]') || promptText.includes('{{image}}') || promptText.includes('[IMAGE]') || optionsText.includes('[image]');
            const hasImageUrl = Boolean(q.image_url && q.image_url.trim().length > 0);

            let statusBadge = '';
            if (hasImageTag && !hasImageUrl) {
                statusBadge = '<span style="background: #fef3c7; color: #d97706; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">🟡 Missing Image</span>';
                detectedCount++;
            } else if (hasImageUrl) {
                statusBadge = '<span style="background: #d1fae5; color: #059669; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">🟢 Has Image</span>';
                if (hasImageTag) detectedCount++;
            } else {
                statusBadge = '<span style="background: #f1f5f9; color: #64748b; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">⚪ No Tag</span>';
            }

            if (onlyFilter && !(hasImageTag || hasImageUrl)) {
                return;
            }

            renderedCount++;
            const cleanPrompt = promptText.replace(/<[^>]*>/g, '').substring(0, 120);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>M${q.module} Q${q.question_number}</strong></td>
                <td>${statusBadge}</td>
                <td style="font-size: 13px; color: #334155;">${cleanPrompt}${cleanPrompt.length >= 120 ? '...' : ''}</td>
                <td>
                    <input type="text" class="form-control q-image-input" data-qid="${q.id}" value="${q.image_url || ''}" placeholder="Paste URL (https://i.postimg.cc/...)" style="font-size: 13px;" />
                </td>
                <td style="text-align: center;">
                    <img id="prev-img-${q.id}" src="${q.image_url || ''}" style="max-height: 40px; max-width: 60px; object-fit: contain; border-radius: 4px; border: 1px solid #cbd5e1; display: ${q.image_url ? 'inline-block' : 'none'};" onError="this.style.display='none'" onLoad="this.style.display='inline-block'" />
                </td>
            `;
            dom.imagesTableBody.appendChild(tr);
        });

        if (renderedCount === 0) {
            dom.imagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#64748b;">No questions requiring images detected in this test!</td></tr>';
        }

        dom.imageStatsCount.textContent = `Phát hiện ${detectedCount} câu có tag [image] / ${currentTestQuestionsForImages.length} câu total (${renderedCount} câu hiển thị)`;

        // Live preview listener on inputs
        document.querySelectorAll('.q-image-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const qid = e.target.getAttribute('data-qid');
                const val = e.target.value.trim();
                const imgEl = document.getElementById(`prev-img-${qid}`);
                if (imgEl) {
                    if (val) {
                        imgEl.src = val;
                        imgEl.style.display = 'inline-block';
                    } else {
                        imgEl.style.display = 'none';
                    }
                }
            });
        });
    }

    if (dom.btnSaveAllImages) {
        dom.btnSaveAllImages.addEventListener('click', async () => {
            const token = await checkAuth();
            if (!token) return;

            const inputs = document.querySelectorAll('.q-image-input');
            const updates = [];

            inputs.forEach(inp => {
                const qid = parseInt(inp.getAttribute('data-qid'), 10);
                const val = inp.value.trim();
                updates.push({ id: qid, image_url: val });
            });

            if (updates.length === 0) {
                alert('No question image links to save.');
                return;
            }

            try {
                dom.btnSaveAllImages.disabled = true;
                dom.btnSaveAllImages.textContent = '⏳ Saving...';
                const res = await fetch('/api/admin/questions/batch-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ updates })
                });

                if (res.ok) {
                    alert(`✅ Successful! Saved image links for ${updates.length} questions.`);
                    dom.imagesModal.classList.add('hidden');
                } else {
                    alert('Failed to save image links.');
                }
            } catch (err) {
                console.error(err);
                alert('Error saving image links.');
            } finally {
                dom.btnSaveAllImages.disabled = false;
                dom.btnSaveAllImages.textContent = '💾 Lưu tất cả link ảnh';
            }
        });
    }

    if (dom.btnCloseImages) {
        dom.btnCloseImages.addEventListener('click', () => {
            dom.imagesModal.classList.add('hidden');
        });
    }

    if (dom.chkOnlyImageQuestions) {
        dom.chkOnlyImageQuestions.addEventListener('change', renderImageQuestionsList);
    }

    // --- CSV / Question Editor Logic ---
    let currentEditingTestId = null;
    let currentEditingTestTitle = '';
    let currentCsvQuestions = [];
    let currentCsvEditorMode = 'table';

    async function openEditCsvModal(testId, testTitle) {
        const token = await checkAuth();
        if (!token) return;

        currentEditingTestId = testId;
        currentEditingTestTitle = testTitle;
        dom.editCsvModalTitle.textContent = `📝 Edit Test Questions & CSV - ${testTitle}`;
        dom.csvTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Loading test questions...</td></tr>';
        dom.editCsvModal.classList.remove('hidden');

        switchCsvEditorTab('table');

        try {
            const res = await fetch(`/api/tests/${testId}/questions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load questions');
            const data = await res.json();
            currentCsvQuestions = data.questions || [];
            
            renderCsvQuestionsTable();
            updateRawCsvTextArea();
        } catch (err) {
            console.error(err);
            alert('Error loading questions for CSV editor');
        }
    }

    function switchCsvEditorTab(mode) {
        currentCsvEditorMode = mode;
        if (mode === 'table') {
            dom.btnTabCsvTable.style.background = '#2563eb';
            dom.btnTabCsvRaw.style.background = '#64748b';
            dom.csvTableView.classList.remove('hidden');
            dom.csvRawView.classList.add('hidden');
        } else {
            dom.btnTabCsvTable.style.background = '#64748b';
            dom.btnTabCsvRaw.style.background = '#2563eb';
            dom.csvTableView.classList.add('hidden');
            dom.csvRawView.classList.remove('hidden');
            updateRawCsvTextArea();
        }
    }

    function renderCsvQuestionsTable() {
        dom.csvTableBody.innerHTML = '';
        dom.csvQuestionCountLabel.textContent = `Tổng số: ${currentCsvQuestions.length} câu hỏi`;

        if (currentCsvQuestions.length === 0) {
            dom.csvTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#64748b;">Chưa có câu hỏi nào trong đề thi này.</td></tr>';
            return;
        }

        currentCsvQuestions.forEach((q, idx) => {
            const tr = document.createElement('tr');
            let opts = q.options;
            if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch(e) { opts = []; }
            }
            if (!Array.isArray(opts)) opts = [];

            let correctText = '';
            if (q.question_type === 'spr') {
                correctText = `<span style="color:#10b981;font-weight:600;">Text: ${q.correct_answer_text || 'N/A'}</span>`;
            } else {
                const letters = ['A', 'B', 'C', 'D'];
                const letter = letters[q.correct_answer_index] || 'A';
                correctText = `<span style="color:#2563eb;font-weight:600;">Option ${letter}</span>`;
            }

            const typeBadge = q.question_type === 'spr' 
                ? '<span style="background:#fef3c7;color:#d97706;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">SPR</span>'
                : '<span style="background:#e0e7ff;color:#4338ca;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">MCQ</span>';

            const cleanPrompt = (q.prompt || '').replace(/<[^>]*>/g, '').substring(0, 100);

            tr.innerHTML = `
                <td style="text-align:center;">Module ${q.module || 1}</td>
                <td style="text-align:center;"><strong>${q.question_number || (idx + 1)}</strong></td>
                <td style="text-align:center;">${typeBadge}</td>
                <td style="color:#334155;">${cleanPrompt}${cleanPrompt.length >= 100 ? '...' : ''}</td>
                <td>${correctText}</td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-admin btn-edit-single-q" data-index="${idx}" style="background:#2563eb;padding:4px 8px;font-size:12px;margin-right:6px;">
                        ✏️ Sửa
                    </button>
                    <button class="btn-admin btn-delete-q-inline" data-index="${idx}" style="background:#ef4444;padding:4px 8px;font-size:12px;">
                        🗑️ Xóa
                    </button>
                </td>
            `;
            dom.csvTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-single-q').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                openSingleQuestionEditModal(index);
            });
        });

        document.querySelectorAll('.btn-delete-q-inline').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                if (confirm(`Bạn có chắc muốn xóa câu Q${currentCsvQuestions[index].question_number} (Module ${currentCsvQuestions[index].module}) khỏi đề thi?`)) {
                    currentCsvQuestions.splice(index, 1);
                    renderCsvQuestionsTable();
                    updateRawCsvTextArea();
                }
            });
        });
    }

    function escapeCSVField(str) {
        if (str === null || str === undefined) return '""';
        let s = String(str);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
            s = s.replace(/"/g, '""');
            return `"${s}"`;
        }
        return `"${s}"`;
    }

    function convertQuestionsToCsvString(questions) {
        const header = "module,question_number,prompt,option_a,option_b,option_c,option_d,correct_answer_index,correct_answer_text,image_url,question_type\n";
        const rows = questions.map(q => {
            let opts = q.options;
            if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch(e) { opts = []; }
            }
            if (!Array.isArray(opts)) opts = [];

            const optA = opts[0] || '';
            const optB = opts[1] || '';
            const optC = opts[2] || '';
            const optD = opts[3] || '';

            return [
                escapeCSVField(q.module || 1),
                escapeCSVField(q.question_number || 1),
                escapeCSVField(q.prompt || ''),
                escapeCSVField(optA),
                escapeCSVField(optB),
                escapeCSVField(optC),
                escapeCSVField(optD),
                escapeCSVField(q.correct_answer_index !== null && q.correct_answer_index !== undefined ? q.correct_answer_index : 0),
                escapeCSVField(q.correct_answer_text || ''),
                escapeCSVField(q.image_url || ''),
                escapeCSVField(q.question_type || 'mcq')
            ].join(',');
        });
        return header + rows.join('\n');
    }

    function updateRawCsvTextArea() {
        if (dom.rawCsvTextArea) {
            dom.rawCsvTextArea.value = convertQuestionsToCsvString(currentCsvQuestions);
        }
    }

    function parseCsvStringToQuestions(csvText) {
        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length <= 1) return [];

        const parseCsvLine = (line) => {
            const result = [];
            let cur = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        cur += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (c === ',' && !inQuotes) {
                    result.push(cur);
                    cur = '';
                } else {
                    cur += c;
                }
            }
            result.push(cur);
            return result;
        };

        const result = [];
        const startIndex = lines[0].toLowerCase().startsWith('module,') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = parseCsvLine(line);
            if (cols.length < 3) continue;

            const mod = parseInt(cols[0], 10) || 1;
            const qNum = parseInt(cols[1], 10) || (i - startIndex + 1);
            const prompt = cols[2] || '';
            const optA = cols[3] || '';
            const optB = cols[4] || '';
            const optC = cols[5] || '';
            const optD = cols[6] || '';
            const correctIndex = cols[7] !== '' && cols[7] !== undefined ? parseInt(cols[7], 10) : 0;
            const correctText = cols[8] || null;
            const imageUrl = cols[9] || null;
            const qType = cols[10] ? cols[10].trim().toLowerCase() : (correctText ? 'spr' : 'mcq');

            result.push({
                module: mod,
                question_number: qNum,
                prompt: prompt,
                options: [optA, optB, optC, optD],
                correct_answer_index: correctIndex,
                correct_answer_text: correctText,
                image_url: imageUrl,
                question_type: qType
            });
        }
        return result;
    }

    if (dom.btnTabCsvTable) dom.btnTabCsvTable.addEventListener('click', () => switchCsvEditorTab('table'));
    if (dom.btnTabCsvRaw) dom.btnTabCsvRaw.addEventListener('click', () => switchCsvEditorTab('raw'));
    if (dom.btnCloseEditCsv) dom.btnCloseEditCsv.addEventListener('click', () => dom.editCsvModal.classList.add('hidden'));

    if (dom.btnSaveCsvChanges) {
        dom.btnSaveCsvChanges.addEventListener('click', async () => {
            const token = await checkAuth();
            if (!token) return;

            let questionsToSave = currentCsvQuestions;
            if (currentCsvEditorMode === 'raw') {
                try {
                    questionsToSave = parseCsvStringToQuestions(dom.rawCsvTextArea.value);
                } catch (e) {
                    alert('Lỗi định dạng CSV. Vui lòng kiểm tra lại văn bản CSV.');
                    return;
                }
            }

            if (!confirm(`Bạn có chắc muốn lưu cập nhật ${questionsToSave.length} câu hỏi vào CSDL cho đề thi này?`)) {
                return;
            }

            try {
                dom.btnSaveCsvChanges.disabled = true;
                dom.btnSaveCsvChanges.textContent = '⏳ Đang lưu...';
                const res = await fetch(`/api/admin/tests/${currentEditingTestId}/questions/replace-all`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ questions: questionsToSave })
                });

                if (res.ok) {
                    alert(`✅ Đã lưu thành công ${questionsToSave.length} câu hỏi vào CSDL!`);
                    dom.editCsvModal.classList.add('hidden');
                } else {
                    alert('Lỗi khi lưu câu hỏi vào CSDL.');
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối khi lưu câu hỏi.');
            } finally {
                dom.btnSaveCsvChanges.disabled = false;
                dom.btnSaveCsvChanges.textContent = '💾 Lưu tất cả thay đổi vào CSDL';
            }
        });
    }

    if (dom.btnExportCurrentCsv) {
        dom.btnExportCurrentCsv.addEventListener('click', () => {
            const csvStr = convertQuestionsToCsvString(currentCsvQuestions);
            const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentEditingTestTitle || 'test'}_questions.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // --- Single Question Form Editor Logic ---
    let currentEditingSingleQIndex = null;

    function openSingleQuestionEditModal(index) {
        const q = currentCsvQuestions[index];
        if (!q) return;

        currentEditingSingleQIndex = index;
        dom.singleQuestionModalTitle.textContent = `✏️ Sửa chi tiết câu Q${q.question_number || (index + 1)} (Module ${q.module || 1})`;
        
        dom.sqModule.value = q.module || 1;
        dom.sqQNum.value = q.question_number || (index + 1);
        dom.sqType.value = q.question_type || 'mcq';
        dom.sqImageUrl.value = q.image_url || '';
        dom.sqPrompt.value = q.prompt || '';
        dom.sqPassage.value = q.passage || '';

        let opts = q.options;
        if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch(e) { opts = []; }
        }
        if (!Array.isArray(opts)) opts = [];

        dom.sqOptA.value = opts[0] || '';
        dom.sqOptB.value = opts[1] || '';
        dom.sqOptC.value = opts[2] || '';
        dom.sqOptD.value = opts[3] || '';
        dom.sqCorrectIndex.value = q.correct_answer_index !== undefined && q.correct_answer_index !== null ? q.correct_answer_index : 0;
        dom.sqCorrectText.value = q.correct_answer_text || '';

        toggleSqFormType(dom.sqType.value);
        dom.singleQuestionModal.classList.remove('hidden');
    }

    function toggleSqFormType(type) {
        if (type === 'spr') {
            dom.sqMcqSection.style.display = 'none';
            dom.sqSprSection.style.display = 'block';
        } else {
            dom.sqMcqSection.style.display = 'block';
            dom.sqSprSection.style.display = 'none';
        }
    }

    if (dom.sqType) {
        dom.sqType.addEventListener('change', (e) => toggleSqFormType(e.target.value));
    }

    if (dom.btnCloseSingleQuestion) {
        dom.btnCloseSingleQuestion.addEventListener('click', () => dom.singleQuestionModal.classList.add('hidden'));
    }
    if (dom.btnCancelSingleQuestion) {
        dom.btnCancelSingleQuestion.addEventListener('click', () => dom.singleQuestionModal.classList.add('hidden'));
    }

    if (dom.singleQuestionForm) {
        dom.singleQuestionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentEditingSingleQIndex === null || !currentCsvQuestions[currentEditingSingleQIndex]) return;

            const qType = dom.sqType.value;
            const updatedQ = {
                ...currentCsvQuestions[currentEditingSingleQIndex],
                module: parseInt(dom.sqModule.value, 10) || 1,
                question_number: parseInt(dom.sqQNum.value, 10) || 1,
                question_type: qType,
                image_url: dom.sqImageUrl.value.trim() || null,
                prompt: dom.sqPrompt.value,
                passage: dom.sqPassage.value ? dom.sqPassage.value : null
            };

            if (qType === 'mcq') {
                updatedQ.options = [
                    dom.sqOptA.value,
                    dom.sqOptB.value,
                    dom.sqOptC.value,
                    dom.sqOptD.value
                ];
                updatedQ.correct_answer_index = parseInt(dom.sqCorrectIndex.value, 10);
                updatedQ.correct_answer_text = null;
            } else {
                updatedQ.options = [];
                updatedQ.correct_answer_index = null;
                updatedQ.correct_answer_text = dom.sqCorrectText.value.trim();
            }

            currentCsvQuestions[currentEditingSingleQIndex] = updatedQ;

            renderCsvQuestionsTable();
            updateRawCsvTextArea();

            dom.singleQuestionModal.classList.add('hidden');
        });
    }

    // Init
    loadTests();
    // Optional: preload student progress
    // loadStudentProgress();
})();
