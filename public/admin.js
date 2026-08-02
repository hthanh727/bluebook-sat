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
        csvFileInput: document.getElementById('csvFileInput')
    };
    
    let currentUploadTestId = null;

    async function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }

        // Try decoding token to check role
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') {
                alert('Access denied. Admin only.');
                window.location.href = 'dashboard.html';
                return false;
            }
        } catch (e) {
            window.location.href = 'login.html';
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
                    <td>
                        <button class="btn-admin btn-add-q" style="background: #10b981; padding: 6px 12px; font-size: 13px;" data-id="${t.id}" data-type="${t.type}">
                            Add Question
                        </button>
                        <button class="btn-admin btn-import-csv" style="background: #8b5cf6; padding: 6px 12px; font-size: 13px; margin-left: 8px;" data-id="${t.id}">
                            Import CSV
                        </button>
                        <button class="btn-admin btn-delete-test" style="background: #ef4444; padding: 6px 12px; font-size: 13px; margin-left: 8px;" data-id="${t.id}">
                            Delete
                        </button>
                    </td>
                `;
                dom.testsTableBody.appendChild(tr);
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
            });

            document.querySelectorAll('.btn-delete-test').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const testId = e.currentTarget.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this test? All questions and progress associated with it will be lost.')) {
                        try {
                            const delRes = await fetch(`/api/admin/tests/${testId}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (delRes.ok) {
                                alert('Test deleted successfully!');
                                loadTests();
                            } else {
                                alert('Failed to delete test.');
                            }
                        } catch (err) {
                            console.error(err);
                            alert('Error deleting test.');
                        }
                    }
                });
            });
        } catch (err) {
            console.error(err);
            alert('Error loading tests');
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
        window.location.href = 'login.html';
    });

    // Init
    loadTests();
})();
