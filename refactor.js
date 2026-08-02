const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'public', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Update State
code = code.replace(
    'selectedNavQuestion: null,',
    `selectedNavQuestion: null,
    testType: 'reading',
    currentSection: 'reading',
    allQuestions: [],`
);

// 2. Load API & Filtering
// Find the fetch API
code = code.replace(
    /const res = await fetch\(`\/api\/tests\/\$\{testId\}\/questions`,.*?SAT_QUESTIONS = await res\.json\(\);/s,
    `const res = await fetch(\`/api/tests/\${testId}/questions\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
        if (!res.ok) throw new Error('Failed to load questions');
        const allFetched = await res.json();
        state.allQuestions = allFetched;
        
        // Fetch test info to get testType
        const tRes = await fetch(\`/api/tests\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
        const tData = await tRes.json();
        const testObj = tData.find(t => t.id == testId);
        state.testType = testObj ? testObj.type : 'reading';
        
        const urlParams = new URLSearchParams(window.location.search);
        state.currentSection = urlParams.get('section') || (state.testType === 'math' ? 'math' : 'reading');
        
        SAT_QUESTIONS = state.allQuestions.filter(q => {
            // For older DB records, section might be null.
            const qSection = q.section || state.testType; 
            return qSection === state.currentSection || qSection === 'full'; // Note: full won't be in section
        });
        
        if (state.currentSection === 'math') {
            state.timerSeconds = 35 * 60;
        } else {
            state.timerSeconds = 32 * 60;
        }`
);

// 3. Render Question Layout Toggle & SPR support
const renderQuestionStart = 'function renderQuestion() {';
const renderQuestionToggle = `
function renderQuestion() {
    const moduleQuestions = getModuleQuestions();
    const q = moduleQuestions[state.currentQuestion];
    if (!q) return;
    const qIndex = state.allQuestions.findIndex(x => x.id === q.id);
    
    const panelLeft = document.getElementById('panelLeft');
    const panelDivider = document.getElementById('panelDivider');
    const btnCalculator = document.getElementById('btnCalculator');
    
    if (state.currentSection === 'math') {
        document.body.classList.add('math-section');
        if(panelLeft) panelLeft.style.display = 'none';
        if(panelDivider) panelDivider.style.display = 'none';
        if(btnCalculator) btnCalculator.style.display = 'flex';
    } else {
        document.body.classList.remove('math-section');
        if(panelLeft) panelLeft.style.display = 'block';
        if(panelDivider) panelDivider.style.display = 'flex';
        if(btnCalculator) btnCalculator.style.display = 'none';
    }
`;
code = code.replace(renderQuestionStart, renderQuestionToggle);

// Replace options rendering with SPR logic
code = code.replace(
    /let optionsHtml = '';\s*if \(q\.options\) \{.*?\}\s*optionsHtml \+= `<\/div>`;/s,
    `let optionsHtml = '';
      if (q.options && q.options.length === 4 && q.options[0] !== "spr") {
        optionsHtml = '<div class="options-group">';
        const labels = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, idx) => {
          const isSelected = state.answers[qIndex] === idx;
          const isStriked = state.strikethroughs && state.strikethroughs[qIndex] && state.strikethroughs[qIndex][idx];
          
          optionsHtml += \`
            <div class="option \${isSelected ? 'selected' : ''} \${isStriked ? 'strikethrough' : ''}" data-index="\${idx}">
              <div class="option-label">\${labels[idx]}</div>
              <div class="option-text">\${opt}</div>
              <button class="btn-strike" title="Strike through" data-index="\${idx}">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <line x1="3" y1="12" x2="21" y2="12"></line>
                 </svg>
              </button>
            </div>
          \`;
        });
        optionsHtml += '</div>';
      } else {
        const sprValue = state.answers[qIndex] !== undefined && state.answers[qIndex] !== null ? state.answers[qIndex] : '';
        optionsHtml = \`
          <div class="spr-container">
            <h4 style="margin-bottom:8px; font-weight:600; color:var(--text);">Student-Produced Response</h4>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Type your answer in the box below.</p>
            <input type="text" class="spr-input" id="sprInput" placeholder="Enter answer" value="\${sprValue}" autocomplete="off">
          </div>
        \`;
      }`
);

// 4. Update Event Listeners for SPR
// After document.querySelectorAll('.option').forEach
code = code.replace(
    /document\.querySelectorAll\('\.option'\)\.forEach\(opt => \{.*?\}\);/s,
    `document.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          if (e.target.closest('.btn-strike')) return;
          if (opt.classList.contains('strikethrough')) return;
          const idx = parseInt(opt.dataset.index);
          if (state.answers[qIndex] === idx) {
            state.answers[qIndex] = null;
          } else {
            state.answers[qIndex] = idx;
          }
          saveProgress(false);
          renderQuestion();
          updateQuestionNav();
        });
      });
      
      const sprInput = document.getElementById('sprInput');
      if (sprInput) {
          sprInput.addEventListener('input', (e) => {
              state.answers[qIndex] = e.target.value.trim();
              saveProgress(false);
              updateQuestionNav();
          });
      }
      `
);

// 5. Update module completion logic
code = code.replace(
    /async function endModule\(\) \{.*?window\.location\.href = 'dashboard\.html';\s*\}/s,
    `async function endModule() {
        if (state.currentModule === 1) {
            state.currentModule = 2;
            state.currentQuestion = 0;
            state.timerSeconds = state.currentSection === 'math' ? 35 * 60 : 32 * 60;
            document.getElementById('navModalClose').click();
            renderQuestion();
            updateQuestionNav();
        } else {
            // Finished Module 2
            await saveProgress(true);
            if (state.testType === 'full' && state.currentSection === 'reading') {
                window.location.href = \`break.html?next=test.html?id=\${testId}%26section=math\`;
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }`
);

// 6. Fix saving logic for math SPR
code = code.replace(
    /if \(pData\.answers\) \{.*?state\.answers = JSON\.parse\(pData\.answers\);.*?\}/s,
    `if (pData.answers) {
        let savedAnswers = JSON.parse(pData.answers);
        if (state.currentSection === 'math' && state.testType === 'full') {
            // Keep existing reading answers, just map them
            state.answers = savedAnswers;
        } else {
            state.answers = savedAnswers;
        }
    }`
);

// 7. Initialize Calculator Listeners
code = code.replace(
    /dom\.btnNext\.addEventListener\('click'/s,
    `const btnCalc = document.getElementById('btnCalculator');
    const calcOverlay = document.getElementById('calcOverlay');
    const calcClose = document.getElementById('calcClose');
    if (btnCalc && calcOverlay) {
        btnCalc.addEventListener('click', () => {
            calcOverlay.style.pointerEvents = 'auto';
            calcOverlay.style.opacity = '1';
        });
        calcClose.addEventListener('click', () => {
            calcOverlay.style.pointerEvents = 'none';
            calcOverlay.style.opacity = '0';
        });
    }
    dom.btnNext.addEventListener('click'`
);


fs.writeFileSync(appJsPath, code);
console.log('app.js successfully refactored.');
