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
        btnTabRecordings: document.getElementById('btnTabRecordings'),
        tabTests: document.getElementById('tabTests'),
        tabProgress: document.getElementById('tabProgress'),
        tabRecordings: document.getElementById('tabRecordings'),
        tabConvert: document.getElementById('tabConvert'),
        btnTabConvert: document.getElementById('btnTabConvert'),
        progressTableBody: document.getElementById('progressTableBody'),
        btnRefreshProgress: document.getElementById('btnRefreshProgress'),
        recordingsTableBody: document.getElementById('recordingsTableBody'),
        btnOpenCreateRecording: document.getElementById('btnOpenCreateRecording'),
        recordingModal: document.getElementById('recordingModal'),
        recordingForm: document.getElementById('recordingForm'),
        btnCancelRecording: document.getElementById('btnCancelRecording'),

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
        sqCorrectText: document.getElementById('sqCorrectText'),

        // Detailed Progress Modal elements
        detailedProgressModal: document.getElementById('detailedProgressModal'),
        detailedProgressTitle: document.getElementById('detailedProgressTitle'),
        btnCloseDetailedProgress: document.getElementById('btnCloseDetailedProgress'),
        dpStudentName: document.getElementById('dpStudentName'),
        dpStudentEmail: document.getElementById('dpStudentEmail'),
        dpTestTitle: document.getElementById('dpTestTitle'),
        dpScore: document.getElementById('dpScore'),
        dpQuestionStats: document.getElementById('dpQuestionStats'),
        dpQuestionList: document.getElementById('dpQuestionList'),
        dpQuestionDetailContainer: document.getElementById('dpQuestionDetailContainer'),
        dpNoSelectedQuestion: document.getElementById('dpNoSelectedQuestion'),
        dpSelectedQuestionDetail: document.getElementById('dpSelectedQuestionDetail'),
        dpQMeta: document.getElementById('dpQMeta'),
        dpQStatusBadge: document.getElementById('dpQStatusBadge'),
        dpPassageSection: document.getElementById('dpPassageSection'),
        dpPromptSection: document.getElementById('dpPromptSection'),
        dpImageSection: document.getElementById('dpImageSection'),
        dpQImage: document.getElementById('dpQImage'),
        dpMcqOptionsSection: document.getElementById('dpMcqOptionsSection'),
        dpSprSection: document.getElementById('dpSprSection'),
        dpStudentSprAnswer: document.getElementById('dpStudentSprAnswer'),
        dpCorrectSprAnswer: document.getElementById('dpCorrectSprAnswer')
    };

    let currentUploadTestId = null;

    function decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
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
        document.getElementById('testDifficultyGroup').style.display = 'none'; // hide by default
        dom.testModal.classList.remove('hidden');
    });

    dom.btnCancelTest.addEventListener('click', () => {
        dom.testModal.classList.add('hidden');
    });

    const testTypeSelect = document.getElementById('testType');
    const testDifficultyGroup = document.getElementById('testDifficultyGroup');
    testTypeSelect.addEventListener('change', () => {
        if (testTypeSelect.value === 'topic') {
            testDifficultyGroup.style.display = 'block';
        } else {
            testDifficultyGroup.style.display = 'none';
        }
    });

    dom.testForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = await checkAuth();
        const title = document.getElementById('testTitle').value;
        const type = document.getElementById('testType').value;
        const difficulty = type === 'topic' ? document.getElementById('testDifficulty').value : null;

        try {
            const res = await fetch('/api/admin/tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, type, difficulty })
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
                    ansIdx = ['A', 'B', 'C', 'D'].indexOf(ansText.toUpperCase());
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
        dom.btnTabRecordings.classList.remove('active');
        dom.tabTests.classList.add('active');
        dom.tabProgress.classList.remove('active');
        dom.tabRecordings.classList.remove('active');
    });

    dom.btnTabProgress.addEventListener('click', () => {
        dom.btnTabProgress.classList.add('active');
        dom.btnTabTests.classList.remove('active');
        dom.btnTabRecordings.classList.remove('active');
        dom.tabProgress.classList.add('active');
        dom.tabTests.classList.remove('active');
        dom.tabRecordings.classList.remove('active');
        loadStudentProgress();
    });

    dom.btnTabRecordings.addEventListener('click', () => {
        dom.btnTabRecordings.classList.add('active');
        dom.btnTabTests.classList.remove('active');
        dom.btnTabProgress.classList.remove('active');
        dom.btnTabConvert.classList.remove('active');
        dom.tabRecordings.classList.add('active');
        dom.tabTests.classList.remove('active');
        dom.tabProgress.classList.remove('active');
        dom.tabConvert.style.display = 'none';
        loadRecordings();
    });

    dom.btnTabConvert.addEventListener('click', () => {
        dom.btnTabConvert.classList.add('active');
        dom.btnTabTests.classList.remove('active');
        dom.btnTabProgress.classList.remove('active');
        dom.btnTabRecordings.classList.remove('active');
        dom.tabConvert.style.display = 'block';
        dom.tabTests.classList.remove('active');
        dom.tabProgress.classList.remove('active');
        dom.tabRecordings.classList.remove('active');
        loadTargetTestsDropdown();
    });

    async function loadTargetTestsDropdown() {
        const select = document.getElementById('convertTargetTest');
        select.innerHTML = '<option value="">-- Chọn bài thi / chuyên đề nhận câu hỏi --</option>';
        try {
            const token = await checkAuth();
            const res = await fetch('/api/tests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const tests = await res.json();
                tests.forEach(test => {
                    const option = document.createElement('option');
                    option.value = test.id;
                    const typeLabel = test.type === 'topic' ? `Chuyên đề` : `Mock Test (${test.type})`;
                    const difficultyLabel = test.difficulty ? ` - ${test.difficulty}` : '';
                    option.textContent = `[${typeLabel}${difficultyLabel}] ${test.title}`;
                    select.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Failed to load target tests dropdown', err);
        }
    }

    let parsedQuestionsList = [];

    document.getElementById('btnParseText').addEventListener('click', () => {
        const rawText = document.getElementById('pdfRawText').value;
        if (!rawText.trim()) {
            alert('Vui lòng dán văn bản từ PDF vào.');
            return;
        }

        parsedQuestionsList = parsePDFText(rawText);
        if (parsedQuestionsList.length === 0) {
            alert('Không tìm thấy câu hỏi hợp lệ nào trong văn bản đã dán.');
            return;
        }

        const previewCard = document.getElementById('parsedPreviewCard');
        const previewBody = document.getElementById('parsedPreviewTableBody');
        const countText = document.getElementById('parsedCountText');
        const importBtn = document.getElementById('btnImportParsed');

        let previewHtml = '';
        parsedQuestionsList.forEach((q, idx) => {
            const optionsHtml = q.question_type === 'mcq'
                ? `<ol type="A" style="margin: 0; padding-left: 20px;">
                    <li>${escapeHtml(q.options[0])}</li>
                    <li>${escapeHtml(q.options[1])}</li>
                    <li>${escapeHtml(q.options[2])}</li>
                    <li>${escapeHtml(q.options[3])}</li>
                  </ol>
                  <strong style="color: #22c55e;">Đáp án đúng:</strong> ${['A','B','C','D'][q.correct_answer_index]}`
                : `<strong style="color: #3b82f6;">Đáp án đúng (SPR):</strong> ${escapeHtml(q.correct_answer_text)}`;
                
            previewHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: 600;">${idx + 1}</td>
                    <td style="padding: 12px;"><span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; ${
                        q.difficulty === 'Easy' ? 'background:rgba(34,197,94,0.15); color:#22c55e;' : 
                        q.difficulty === 'Hard' ? 'background:rgba(239,68,68,0.15); color:#ef4444;' : 
                        'background:rgba(245,158,11,0.15); color:#f59e0b;'
                    }">${q.difficulty}</span></td>
                    <td style="padding: 12px; font-size: 12px; font-weight: 600; color: #64748b;">${q.question_type.toUpperCase()}</td>
                    <td style="padding: 12px; white-space: pre-wrap; font-size: 13px;">${escapeHtml(q.prompt)}</td>
                    <td style="padding: 12px; font-size: 13px;">${optionsHtml}</td>
                </tr>
            `;
        });

        previewBody.innerHTML = previewHtml;
        countText.textContent = parsedQuestionsList.length;
        previewCard.style.display = 'block';
        importBtn.style.display = 'inline-block';
    });

    document.getElementById('btnImportParsed').addEventListener('click', async () => {
        const targetTestId = document.getElementById('convertTargetTest').value;
        if (!targetTestId) {
            alert('Vui lòng chọn bài thi/chuyên đề nhận câu hỏi.');
            return;
        }

        if (parsedQuestionsList.length === 0) {
            alert('Không có câu hỏi nào để nhập.');
            return;
        }

        const token = await checkAuth();
        try {
            const res = await fetch(`/api/admin/tests/${targetTestId}/questions/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ questions: parsedQuestionsList })
            });

            if (res.ok) {
                alert(`Nhập thành công ${parsedQuestionsList.length} câu hỏi!`);
                document.getElementById('pdfRawText').value = '';
                document.getElementById('parsedPreviewCard').style.display = 'none';
                document.getElementById('btnImportParsed').style.display = 'none';
                parsedQuestionsList = [];
            } else {
                const err = await res.json();
                alert('Lỗi khi nhập câu hỏi: ' + (err.message || 'Không xác định'));
            }
        } catch (err) {
            console.error('Import failed', err);
            alert('Lỗi kết nối khi gửi yêu cầu nhập câu hỏi.');
        }
    });

    function parsePDFText(text) {
        // Clean line endings
        const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Split by "Question ID:"
        const blocks = cleanText.split(/Question ID:/gi);
        const questions = [];
        
        blocks.forEach(block => {
            if (!block.trim()) return;
            
            const fullBlock = "Question ID:" + block;
            
            // Extract Question ID
            const idMatch = fullBlock.match(/Question ID:\s*([a-zA-Z0-9]+)/i);
            const qId = idMatch ? idMatch[1] : '';
            
            // Extract Difficulty
            let difficulty = 'Medium';
            const diffMatch = fullBlock.match(/Difficulty\s*\n.*?(Easy|Medium|Hard)/is) || fullBlock.match(/(Easy|Medium|Hard)\s*\n\s*Question/i);
            if (diffMatch) {
                difficulty = diffMatch[1].trim();
            }
            
            // Extract Question prompt
            let prompt = '';
            let options = [];
            let qType = 'spr';
            let correct_answer_text = '';
            let correct_answer_index = null;
            
            const questionIndex = fullBlock.search(/\nQuestion\n/i);
            let startSearchIndex = questionIndex !== -1 ? questionIndex + 10 : 0;
            if (questionIndex === -1) {
                const lines = fullBlock.split('\n');
                const qLineIdx = lines.findIndex(l => l.trim().toLowerCase() === 'question');
                if (qLineIdx !== -1) {
                    startSearchIndex = fullBlock.indexOf(lines[qLineIdx]) + lines[qLineIdx].length;
                }
            }
            
            let endSearchIndex = fullBlock.search(/\nAnswer\n|\nAnswer\r\n|\nCorrect Answer:/i);
            if (endSearchIndex === -1) {
                endSearchIndex = fullBlock.search(/\nRationale\n/i);
            }
            
            if (startSearchIndex !== -1 && endSearchIndex !== -1 && startSearchIndex < endSearchIndex) {
                prompt = fullBlock.substring(startSearchIndex, endSearchIndex).trim();
            } else if (questionIndex !== -1) {
                prompt = fullBlock.substring(questionIndex + 10).trim();
            }
            
            // Check if MCQ
            const answerIndex = fullBlock.search(/\nAnswer\n|\nAnswer\r\n/i);
            if (answerIndex !== -1) {
                qType = 'mcq';
                const correctAnsIndex = fullBlock.search(/\nCorrect Answer:/i);
                if (correctAnsIndex !== -1 && correctAnsIndex > answerIndex) {
                    const optionsSection = fullBlock.substring(answerIndex + 7, correctAnsIndex).trim();
                    const optAMatch = optionsSection.match(/^[A]\.\s*(.*?)(?=\n[B]\.|\r\n[B]\.|$)/is);
                    const optBMatch = optionsSection.match(/\n[B]\.\s*(.*?)(?=\n[C]\.|\r\n[C]\.|$)/is);
                    const optCMatch = optionsSection.match(/\n[C]\.\s*(.*?)(?=\n[D]\.|\r\n[D]\.|$)/is);
                    const optDMatch = optionsSection.match(/\n[D]\.\s*(.*?)$/is);
                    
                    options = [
                        optAMatch ? optAMatch[1].trim() : '',
                        optBMatch ? optBMatch[1].trim() : '',
                        optCMatch ? optCMatch[1].trim() : '',
                        optDMatch ? optDMatch[1].trim() : ''
                    ];
                }
            }
            
            // Correct Answer
            const corrAnsMatch = fullBlock.match(/Correct Answer:\s*(.*?)(?=\nRationale|\r\nRationale|$)/is);
            if (corrAnsMatch) {
                const ansStr = corrAnsMatch[1].trim();
                if (qType === 'mcq') {
                    correct_answer_index = ['A', 'B', 'C', 'D'].indexOf(ansStr.toUpperCase());
                    if (correct_answer_index === -1) correct_answer_index = 0;
                } else {
                    correct_answer_text = ansStr;
                }
            }
            
            if (prompt) {
                questions.push({
                    question_number: questions.length + 1,
                    passage: '',
                    prompt: prompt,
                    options: qType === 'mcq' ? options : null,
                    correct_answer_index: correct_answer_index,
                    correct_answer_text: qType === 'spr' ? correct_answer_text : null,
                    question_type: qType,
                    difficulty: difficulty,
                    section: 'math' 
                });
            }
        });
        
        return questions;
    }

    dom.btnTabRecordings.addEventListener('click', () => {
        dom.btnTabRecordings.classList.add('active');
        dom.btnTabTests.classList.remove('active');
        dom.btnTabProgress.classList.remove('active');
        dom.tabRecordings.classList.add('active');
        dom.tabTests.classList.remove('active');
        dom.tabProgress.classList.remove('active');
        loadRecordings();
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
    // --- Load Student Progress ---
    function resolveImageUrl(url) {
        if (typeof url !== 'string') return url;
        let cleanUrl = url.trim();
        if (cleanUrl.includes('imgur.com') && !cleanUrl.includes('i.imgur.com')) {
            const match = cleanUrl.match(/https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/);
            if (match) {
                return `https://i.imgur.com/${match[1]}.png`;
            }
        }
        if ((cleanUrl.includes('postimg.cc') || cleanUrl.includes('postimages.org')) && !cleanUrl.includes('i.postimg.cc')) {
            const match = cleanUrl.match(/https?:\/\/(?:www\.)?(?:postimg\.cc|postimages\.org)\/([a-zA-Z0-9]+)$/);
            if (match) {
                return `https://i.postimg.cc/${match[1]}/image.png`;
            }
        }
        return cleanUrl;
    }

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
                    <td>
                        <button class="btn-admin btn-view-dp" style="background: #3b82f6; padding: 4px 10px; font-size: 12px;">
                            👁️ Chi tiết
                        </button>
                    </td>
                `;

                const viewBtn = tr.querySelector('.btn-view-dp');
                viewBtn.addEventListener('click', () => {
                    openDetailedProgressModal(p);
                });

                dom.progressTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            alert('Error loading student progress');
        }
    }

    async function openDetailedProgressModal(progressItem) {
        const token = await checkAuth();
        if (!token) return;

        // Reset details view
        dom.dpStudentName.textContent = progressItem.student_name;
        dom.dpStudentEmail.textContent = progressItem.student_email;
        dom.dpTestTitle.textContent = progressItem.test_title;

        // Handle answers array (could be string or parsed array)
        let answers = [];
        try {
            answers = typeof progressItem.answers === 'string'
                ? JSON.parse(progressItem.answers)
                : progressItem.answers;
        } catch (e) {
            console.error('Failed to parse answers:', e);
        }
        if (!Array.isArray(answers)) answers = [];

        // Show loading state
        dom.dpQuestionList.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">Loading questions...</div>';
        dom.dpNoSelectedQuestion.classList.remove('hidden');
        dom.dpSelectedQuestionDetail.classList.add('hidden');
        dom.detailedProgressModal.classList.remove('hidden');

        try {
            // Fetch test questions
            const res = await fetch(`/api/tests/${progressItem.test_id}/questions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load test questions');
            const data = await res.json();
            const questions = data.questions || [];

            const test = data.test || {};
            const testType = test.type || progressItem.test_type || 'math';

            dom.dpScore.textContent = `${progressItem.score} / ${questions.length}`;

            // Calculate correct, incorrect, unanswered count
            let correctCount = 0;
            let incorrectCount = 0;
            let unansweredCount = 0;

            const analyzedQuestions = questions.map((q, idx) => {
                const ans = answers[idx];
                let isCorrect = false;
                let isAnswered = ans !== null && ans !== undefined && ans !== '';

                if (isAnswered) {
                    if (q.question_type === 'spr') {
                        if (q.correct_answer_text && ans.toString().trim().toLowerCase() === q.correct_answer_text.trim().toLowerCase()) {
                            isCorrect = true;
                        }
                    } else {
                        if (parseInt(ans) === parseInt(q.correct_answer_index)) {
                            isCorrect = true;
                        }
                    }
                }

                if (isCorrect) correctCount++;
                else if (isAnswered) incorrectCount++;
                else unansweredCount++;

                return {
                    question: q,
                    index: idx,
                    studentAnswer: ans,
                    isCorrect,
                    isAnswered
                };
            });

            dom.dpQuestionStats.textContent = `Đúng: ${correctCount} | Sai: ${incorrectCount} | Trống: ${unansweredCount}`;

            // Render list of questions
            dom.dpQuestionList.innerHTML = '';

            analyzedQuestions.forEach(aq => {
                const div = document.createElement('div');
                div.className = 'dp-q-item';

                let badgeBg = '#cbd5e1';
                let badgeColor = '#334155';
                let badgeText = 'Trống';

                if (aq.isAnswered) {
                    if (aq.isCorrect) {
                        badgeBg = '#dcfce7';
                        badgeColor = '#166534';
                        badgeText = 'Đúng';
                    } else {
                        badgeBg = '#fee2e2';
                        badgeColor = '#991b1b';
                        badgeText = 'Sai';
                    }
                }

                let section = aq.question.section;
                if (testType === 'math' || testType === 'reading') {
                    section = testType;
                } else {
                    section = section || 'reading';
                }
                let sectionLabel = section === 'math' ? 'Math' : 'R&W';
                let promptSnippet = aq.question.prompt ? aq.question.prompt.substring(0, 30) + '...' : '';
                promptSnippet = promptSnippet.replace(/\\/g, '').replace(/\$/g, '');

                div.innerHTML = `
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 600; font-size: 13px; color: #1e293b;">M${aq.question.module || 1} - Câu ${aq.question.question_number} (${sectionLabel})</span>
                        <span style="font-size: 11px; color: #64748b; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${promptSnippet}</span>
                    </div>
                    <span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${badgeBg}; color: ${badgeColor};">${badgeText}</span>
                `;

                div.addEventListener('click', () => {
                    dom.dpQuestionList.querySelectorAll('.dp-q-item').forEach(item => item.classList.remove('selected'));
                    div.classList.add('selected');
                    showQuestionDetails(aq, testType);
                });

                dom.dpQuestionList.appendChild(div);
            });

        } catch (err) {
            console.error(err);
            dom.dpQuestionList.innerHTML = '<div style="text-align:center; padding:20px; color:#ef4444;">Error loading questions.</div>';
        }
    }

    function showQuestionDetails(aq, testType) {
        const q = aq.question;
        dom.dpNoSelectedQuestion.classList.add('hidden');
        dom.dpSelectedQuestionDetail.classList.remove('hidden');

        // Set metadata
        let section = q.section;
        if (testType === 'math' || testType === 'reading') {
            section = testType;
        } else {
            section = section || 'reading';
        }
        let sectionLabel = section === 'math' ? 'Math' : 'Reading & Writing';
        dom.dpQMeta.textContent = `${sectionLabel} - Module ${q.module || 1} - Câu ${q.question_number}`;

        // Status Badge
        if (!aq.isAnswered) {
            dom.dpQStatusBadge.textContent = 'Chưa làm (Trống)';
            dom.dpQStatusBadge.className = 'status-badge';
            dom.dpQStatusBadge.style.background = '#f1f5f9';
            dom.dpQStatusBadge.style.color = '#475569';
        } else if (aq.isCorrect) {
            dom.dpQStatusBadge.textContent = 'Đúng';
            dom.dpQStatusBadge.className = 'status-badge status-completed';
            dom.dpQStatusBadge.style.background = '';
            dom.dpQStatusBadge.style.color = '';
        } else {
            dom.dpQStatusBadge.textContent = 'Sai';
            dom.dpQStatusBadge.className = 'status-badge';
            dom.dpQStatusBadge.style.background = '#fee2e2';
            dom.dpQStatusBadge.style.color = '#991b1b';
        }

        // Passage section
        if (q.passage && q.passage.trim() !== '') {
            dom.dpPassageSection.textContent = q.passage;
            dom.dpPassageSection.classList.remove('hidden');
        } else {
            dom.dpPassageSection.classList.add('hidden');
        }

        // Image & Prompt processing
        let imageHtml = '';
        const hasValidImage = q.image_url && q.image_url.trim() !== '';
        if (hasValidImage) {
            const resolved = resolveImageUrl(q.image_url);
            imageHtml = `<div style="text-align: center; margin: 16px 0;"><img src="${resolved}" style="max-width: 100%; max-height: 250px; border: 1px solid #e2e8f0; border-radius: 8px;" alt="Question Image" /></div>`;
        }

        let promptHtml = q.prompt || '';
        let imageReplaced = false;

        if (hasValidImage) {
            if (promptHtml.includes('[image]')) {
                promptHtml = promptHtml.replace('[image]', imageHtml);
                imageReplaced = true;
            } else if (promptHtml.includes('{{image}}')) {
                promptHtml = promptHtml.replace('{{image}}', imageHtml);
                imageReplaced = true;
            } else if (promptHtml.includes('[IMAGE]')) {
                promptHtml = promptHtml.replace('[IMAGE]', imageHtml);
                imageReplaced = true;
            }
        } else {
            promptHtml = promptHtml.replace('[image]', '').replace('{{image}}', '').replace('[IMAGE]', '');
        }

        dom.dpPromptSection.innerHTML = promptHtml;

        if (hasValidImage && !imageReplaced) {
            dom.dpQImage.src = resolveImageUrl(q.image_url);
            dom.dpImageSection.classList.remove('hidden');
        } else {
            dom.dpImageSection.classList.add('hidden');
        }

        // MCQ Options vs SPR input
        if (q.question_type === 'spr') {
            dom.dpMcqOptionsSection.classList.add('hidden');
            dom.dpSprSection.classList.remove('hidden');

            dom.dpStudentSprAnswer.textContent = aq.isAnswered ? aq.studentAnswer : '(Không trả lời)';
            dom.dpCorrectSprAnswer.textContent = q.correct_answer_text || '-';

            if (!aq.isAnswered) {
                dom.dpStudentSprAnswer.style.background = '#f1f5f9';
                dom.dpStudentSprAnswer.style.color = '#475569';
            } else if (aq.isCorrect) {
                dom.dpStudentSprAnswer.style.background = '#dcfce7';
                dom.dpStudentSprAnswer.style.color = '#166534';
            } else {
                dom.dpStudentSprAnswer.style.background = '#fee2e2';
                dom.dpStudentSprAnswer.style.color = '#991b1b';
            }
        } else {
            dom.dpSprSection.classList.add('hidden');
            dom.dpMcqOptionsSection.classList.remove('hidden');

            let options = [];
            try {
                options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            } catch (e) {
                console.error('Failed to parse MCQ options:', e);
            }
            if (!Array.isArray(options)) options = [];

            dom.dpMcqOptionsSection.innerHTML = '';

            const letters = ['A', 'B', 'C', 'D'];
            options.forEach((optText, i) => {
                const box = document.createElement('div');
                box.className = 'option-detail-box';

                const isStudentChoice = aq.isAnswered && parseInt(aq.studentAnswer) === i;
                const isCorrectChoice = parseInt(q.correct_answer_index) === i;

                if (isCorrectChoice) {
                    box.classList.add('correct');
                } else if (isStudentChoice) {
                    box.classList.add('incorrect-choice');
                }

                let badge = '';
                if (isCorrectChoice) {
                    badge = ' <span style="margin-left: auto; color:#10b981; font-weight:bold;">✅ Đáp án đúng</span>';
                }
                if (isStudentChoice && !isCorrectChoice) {
                    badge = ' <span style="margin-left: auto; color:#ef4444; font-weight:bold;">❌ Lựa chọn của HS</span>';
                }
                if (isStudentChoice && isCorrectChoice) {
                    badge = ' <span style="margin-left: auto; color:#10b981; font-weight:bold;">✅ Lựa chọn của HS (Đúng)</span>';
                }

                box.innerHTML = `
                    <span class="option-letter">${letters[i]}.</span>
                    <span style="flex-grow: 1;">${optText}</span>
                    ${badge}
                `;
                dom.dpMcqOptionsSection.appendChild(box);
            });
        }

        if (window.MathJax) {
            window.MathJax.typesetPromise([dom.dpSelectedQuestionDetail]).catch((err) => console.log('MathJax error in progress view', err));
        }
    }

    if (dom.btnCloseDetailedProgress) {
        dom.btnCloseDetailedProgress.addEventListener('click', () => {
            dom.detailedProgressModal.classList.add('hidden');
        });
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
                try { opts = JSON.parse(opts); } catch (e) { opts = []; }
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
                try { opts = JSON.parse(opts); } catch (e) { opts = []; }
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
            try { opts = JSON.parse(opts); } catch (e) { opts = []; }
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

    // --- Recordings Management ---
    async function loadRecordings() {
        const token = await checkAuth();
        try {
            const res = await fetch('/api/recordings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const recordings = await res.json();
                dom.recordingsTableBody.innerHTML = '';
                if (recordings.length === 0) {
                    dom.recordingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">No recordings uploaded yet.</td></tr>';
                    return;
                }
                recordings.forEach(rec => {
                    const tr = document.createElement('tr');
                    const dateStr = new Date(rec.created_at).toLocaleString('vi-VN');
                    tr.innerHTML = `
                        <td>${rec.id}</td>
                        <td style="font-weight: 600;">${escapeHtml(rec.title)}</td>
                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(rec.description || '')}</td>
                        <td><a href="${rec.video_url}" target="_blank" style="color: #3b82f6; text-decoration: none; word-break: break-all;">${escapeHtml(rec.video_url)}</a></td>
                        <td>${dateStr}</td>
                        <td>
                            <button class="btn-admin btn-delete-recording" style="background: #ef4444; padding: 4px 8px; font-size: 12px;" data-id="${rec.id}">Delete</button>
                        </td>
                    `;
                    tr.querySelector('.btn-delete-recording').addEventListener('click', () => deleteRecording(rec.id));
                    dom.recordingsTableBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('Error loading recordings:', err);
        }
    }

    async function deleteRecording(id) {
        if (!confirm('Are you sure you want to delete this recording?')) return;
        const token = await checkAuth();
        try {
            const res = await fetch(`/api/admin/recordings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                loadRecordings();
            } else {
                alert('Failed to delete recording.');
            }
        } catch (err) {
            console.error('Error deleting recording:', err);
        }
    }

    dom.btnOpenCreateRecording.addEventListener('click', () => {
        dom.recordingForm.reset();
        dom.recordingModal.classList.remove('hidden');
    });

    dom.btnCancelRecording.addEventListener('click', () => {
        dom.recordingModal.classList.add('hidden');
    });

    dom.recordingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = await checkAuth();
        const title = document.getElementById('recordingTitle').value.trim();
        const description = document.getElementById('recordingDescription').value.trim();
        const video_url = document.getElementById('recordingVideoUrl').value.trim();

        try {
            const res = await fetch('/api/admin/recordings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, video_url })
            });
            if (res.ok) {
                dom.recordingModal.classList.add('hidden');
                loadRecordings();
            } else {
                alert('Failed to save recording.');
            }
        } catch (err) {
            console.error('Error saving recording:', err);
        }
    });

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Init
    loadTests();
    // Optional: preload student progress
    // loadStudentProgress();
})();
