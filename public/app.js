// ====================================
// Bluebook SAT – Main Application Logic
// ====================================

(function () {
  'use strict';

  // ---- State ----
  let SAT_QUESTIONS = [];

  // ---- Image Helper Functions ----
  function isImageUrl(url) {
    if (typeof url !== 'string') return false;
    const cleanUrl = url.trim();
    return cleanUrl.startsWith('http://') || 
           cleanUrl.startsWith('https://') || 
           cleanUrl.startsWith('/') || 
           cleanUrl.startsWith('./') ||
           cleanUrl.startsWith('data:image/');
  }

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
  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('id');
  const sectionParam = urlParams.get('section');
  const typeParam = urlParams.get('type');

  const state = {
    currentQuestion: 0,
    currentModule: 1,
    testId: testId,
    answers: [],
    flagged: [],
    timerSeconds: 32 * 60,
    timerHidden: false,
    timerInterval: null,
    annotateMode: false,
    selectedNavQuestion: null,
    testType: typeParam || 'reading',
    currentSection: sectionParam || 'reading',
    allQuestions: [],
    reviewMode: false,
    bookmarked: [],
  };

  // ---- DOM References ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    timerDisplay: $('#timerDisplay'),
    timerContainer: $('#timerContainer'),
    btnHideTimer: $('#btnHideTimer'),
    btnMore: $('#btnMore'),
    moreDropdown: $('#moreDropdown'),
    btnAnnotate: $('#btnAnnotate'),
    btnHelp: $('#btnHelp'),
    btnExitTest: $('#btnExitTest'),
    directionsBanner: $('#directionsBanner'),
    directionsClose: $('#directionsClose'),
    passageContainer: $('#passageContainer'),
    questionContainer: $('#questionContainer'),
    btnBack: $('#btnBack'),
    btnNext: $('#btnNext'),
    btnQuestionNav: $('#btnQuestionNav'),
    questionNavLabel: $('#questionNavLabel'),
    questionNavOverlay: $('#questionNavOverlay'),
    questionNavModal: $('#questionNavModal'),
    navModalClose: $('#navModalClose'),
    questionGrid: $('#questionGrid'),
    btnGoTo: $('#btnGoTo'),

    highlightTooltip: $('#highlightToolbar'),
    tooltipHighlight: $('#hlApply'),
    tooltipRemove: $('#hlRemove'),
    btnHlNote: $('#hlNote'),
    annotationPopup: $('#annotationPopup'),
    annotationClose: $('#annotationClose'),
    annotationCancel: $('#annotationCancel'),
    annotationSave: $('#annotationSave'),
    annotationTextarea: $('#annotationTextarea'),
    toast: $('#toast'),
    toastMessage: $('#toastMessage'),
    mainContent: $('#mainContent'),
    panelLeft: $('#panelLeft'),
    transitionOverlay: $('#transitionOverlay'),
    scoreOverlay: $('#scoreOverlay'),
    scoreCorrect: $('#scoreCorrect'),
    scoreTotal: $('#scoreTotal'),
    btnScoreHome: $('#btnScoreHome'),
    btnScoreReview: $('#btnScoreReview'),
    errorLogOverlay: $('#errorLogOverlay'),
    btnCloseErrorLog: $('#btnCloseErrorLog'),
    btnExportPDF: $('#btnExportPDF'),
    errorLogContent: $('#error-log-content'),
  };

  // ---- Theme Toggle ----
  (function initTheme() {
    const saved = localStorage.getItem('sat-theme');
    if (saved !== 'light') document.documentElement.classList.add('dark');
    const btn = document.getElementById('themeToggleTest');
    if (btn) {
      btn.addEventListener('click', () => {
        document.documentElement.classList.add('theme-transition');
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('sat-theme', isDark ? 'dark' : 'light');
        setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500);
      });
    }
  })();

  // ---- Timer ----
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      if (state.timerSeconds > 0) {
        state.timerSeconds--;
        updateTimerDisplay();
        localStorage.setItem(`sat-timer-${state.testId}-${state.testType}-${state.currentModule}`, state.timerSeconds);
      } else {
        clearInterval(state.timerInterval);
        const half = Math.ceil(SAT_QUESTIONS.length / 2);
        if (state.currentModule === 1) {
          showToast('Time is up! Transitioning to Module 2.', '#f59e0b');
          setTimeout(() => {
            goToQuestion(half);
          }, 1000);
        } else {
          showToast('Time is up! Submitting exam.', '#ef4444');
          setTimeout(() => {
            calculateScore();
          }, 1000);
        }
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const m = Math.floor(state.timerSeconds / 60);
    const s = state.timerSeconds % 60;
    dom.timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (state.timerSeconds <= 300) {
      dom.timerDisplay.style.color = '#fbbf24';
    }
    if (state.timerSeconds <= 60) {
      dom.timerDisplay.style.color = '#ef4444';
      dom.timerDisplay.style.animation = 'pulse 1s infinite';
    }
  }

  function toggleTimer() {
    state.timerHidden = !state.timerHidden;
    dom.timerContainer.classList.toggle('timer-hidden', state.timerHidden);
    dom.btnHideTimer.textContent = state.timerHidden ? 'Show' : 'Hide';
  }

  function checkIfAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch (e) {
      return false;
    }
  }

  // Disable DevTools access for students
  if (!checkIfAdmin()) {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      // Disable F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+U, Ctrl+U
      if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'U'].includes(e.key.toUpperCase())) ||
          (e.ctrlKey && e.key.toUpperCase() === 'U')) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Debug helper to quickly test timer expiration from browser console (Admin only)
  if (checkIfAdmin()) {
    window.setTimer = (seconds) => {
      state.timerSeconds = seconds;
      updateTimerDisplay();
      console.log(`⏱️ Debug: Timer set to ${seconds} seconds`);
    };
  }

  // ---- Render Question ----
  
function renderQuestion() {
    if (!SAT_QUESTIONS || SAT_QUESTIONS.length === 0) return;
    const q = SAT_QUESTIONS[state.currentQuestion];
    if (!q) return;

    localStorage.setItem(`sat-resume-${state.testId}-${state.testType}`, JSON.stringify({ currentQuestion: state.currentQuestion, currentModule: state.currentModule }));

    const panelLeft = document.getElementById('panelLeft');
    const panelDivider = document.getElementById('panelDivider');
    const btnCalculator = document.getElementById('btnCalculator');
    
    const currentSec = q.section ? q.section.toLowerCase() : state.testType;
    const panelRight = document.getElementById('panelRight');
    
    if (currentSec === 'math') {
        document.body.classList.add('math-section');
        if(btnCalculator) btnCalculator.style.display = 'flex';
        
        if (q.question_type === 'spr') {
            if(panelLeft) panelLeft.style.display = 'block';
            if(panelDivider) panelDivider.style.display = 'flex';
            if(panelRight) panelRight.classList.add('spr-active');
        } else {
            if(panelLeft) panelLeft.style.display = 'none';
            if(panelDivider) panelDivider.style.display = 'none';
            if(panelRight) panelRight.classList.remove('spr-active');
        }
    } else {
        document.body.classList.remove('math-section');
        if(panelLeft) panelLeft.style.display = 'block';
        if(panelDivider) panelDivider.style.display = 'flex';
        if(btnCalculator) btnCalculator.style.display = 'none';
        if(panelRight) panelRight.classList.remove('spr-active');
    }

    // Handle Module Title
    const moduleTitle = document.getElementById('moduleTitle');
    if (moduleTitle) {
      if (currentSec === 'math') {
          moduleTitle.textContent = state.testType === 'full' ? `Section 2: Math Module ${state.currentModule}` : `Section 1: Math Module ${state.currentModule}`;
      } else {
          moduleTitle.textContent = `Section 1: Reading and Writing Module ${state.currentModule}`;
      }
    }

    // Question Number
    const sectionQuestions = SAT_QUESTIONS.filter(x => {
        const sec = x.section ? x.section.toLowerCase() : state.testType;
        return sec === currentSec;
    });
    const half = Math.ceil(sectionQuestions.length / 2);
    const firstQIndex = SAT_QUESTIONS.findIndex(x => {
        const sec = x.section ? x.section.toLowerCase() : state.testType;
        return sec === currentSec;
    });
    const sectionQIndex = state.currentQuestion - firstQIndex;
    const displayNum = state.currentModule === 1 ? sectionQIndex + 1 : sectionQIndex - half + 1;
    dom.questionNavLabel.innerHTML = `Question ${displayNum} of ${half} <span class="arrow-down"></span>`;

    // Passage
    if (currentSec === 'math' && q.question_type === 'spr') {
        dom.passageContainer.innerHTML = `
            <div class="spr-instructions" style="padding: 20px;">
                <h3 style="margin-top:0; font-weight:600; font-size:18px;">Student-Produced Response Instructions</h3>
                <ul style="font-size:15px; line-height:1.6; color:var(--text-muted); padding-left:20px; margin-top:16px;">
                    <li style="margin-bottom:8px;">If you find more than one correct answer, enter only one answer.</li>
                    <li style="margin-bottom:8px;">You can enter up to 5 characters for a positive answer and up to 6 characters (including the negative sign) for a negative answer.</li>
                    <li style="margin-bottom:8px;">If your answer is a fraction that doesn't fit in the provided space, enter the decimal equivalent.</li>
                    <li style="margin-bottom:8px;">If your answer is a decimal that doesn't fit in the provided space, enter it by truncating or rounding at the fourth digit.</li>
                    <li style="margin-bottom:8px;">If your answer is a mixed number (such as 3 1/2), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li>
                    <li>Don't enter symbols such as a percent sign, comma, or dollar sign.</li>
                </ul>
            </div>
        `;
    } else if (q.passage) {
      dom.passageContainer.innerHTML = `<div class="passage-text" id="passageText">${q.passage.replace(/\n/g, '<br>')}</div>`;
    } else {
      dom.passageContainer.innerHTML = `<div class="passage-text" id="passageText"><em>No passage for this question.</em></div>`;
    }

    // Image (if any)
    let imageHtml = '';
    if (q.image_url && isImageUrl(q.image_url)) {
      const resolved = resolveImageUrl(q.image_url);
      imageHtml = `<img src="${resolved}" class="question-image" alt="Question Image" />`;
    }

    let promptHtml = q.prompt;
    if (imageHtml) {
      if (promptHtml.includes('[image]')) {
        promptHtml = promptHtml.replace('[image]', imageHtml);
        imageHtml = '';
      } else if (promptHtml.includes('{{image}}')) {
        promptHtml = promptHtml.replace('{{image}}', imageHtml);
        imageHtml = '';
      }
    }
    promptHtml = promptHtml.replace(/\\\)\s+\\\(/g, '\\)<br>\\(');

    // Parse options
    let parsedOpts = q.options;
    if (typeof parsedOpts === 'string') {
      try { parsedOpts = JSON.parse(parsedOpts); } catch(e) { parsedOpts = []; }
    }

    // Question + options
    const letters = ['A', 'B', 'C', 'D'];
    let optionsHtml = '';
    
    if (parsedOpts && parsedOpts.length > 0) {
        parsedOpts.forEach((opt, i) => {
          let reviewClass = '';
          if (state.reviewMode) {
            if (i === q.correct_answer_index) reviewClass = 'review-correct';
            else if (state.answers[state.currentQuestion] === i && i !== q.correct_answer_index) reviewClass = 'review-wrong';
          }
          const selected = state.answers[state.currentQuestion] === i && !state.reviewMode ? 'selected' : '';
          const resolvedOpt = resolveImageUrl(opt);
          const optionContent = isImageUrl(resolvedOpt)
            ? `<img src="${resolvedOpt}" class="option-image" style="max-height: 120px; object-fit: contain; display: block;" alt="Option ${letters[i]}" />`
            : opt;
          optionsHtml += `
            <div class="answer-option ${selected} ${reviewClass}" data-index="${i}" id="answer-option-${i}">
              <span class="answer-letter">${letters[i]}</span>
              <span class="answer-text">${optionContent}</span>
              ${!state.reviewMode ? `<button class="strikethrough-btn" title="Cross out" data-index="${i}">S&#x0336;</button>` : ''}
            </div>`;
        });
    } else {
        const sprValue = state.answers[state.currentQuestion] !== undefined && state.answers[state.currentQuestion] !== null ? state.answers[state.currentQuestion] : '';
        let reviewHtml = '';
        if (state.reviewMode) {
            const isCorrect = sprValue.toString().trim().toLowerCase() === (q.correct_answer_text || '').toLowerCase();
            reviewHtml = `
              <div style="margin-top: 10px; font-weight: 600; color: ${isCorrect ? '#22c55e' : '#ef4444'}">
                  Your Answer: ${sprValue} ${isCorrect ? '✅' : '❌'}<br>
                  Correct Answer: ${q.correct_answer_text}
              </div>
            `;
        }
        optionsHtml = `
          <div class="spr-container" style="background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px;">
            <input type="text" class="spr-input" id="sprInput" placeholder="Enter answer" value="${sprValue}" autocomplete="off" ${state.reviewMode ? 'disabled' : ''} style="width: 100%; max-width: 250px; padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 16px; background: var(--bg-card); color: var(--text);">
            ${reviewHtml}
          </div>
        `;
    }

    const idx = state.currentQuestion;
    const flagged = state.flagged[idx] ? 'flagged' : '';
    const relativeIdx = state.currentModule === 1 ? idx : idx - half;
    const moduleLabel = state.currentModule === 1 ? 'Module 1' : 'Module 2';
    const isBookmarked = state.bookmarked.includes(q.id);

    dom.questionContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${moduleLabel} · Question ${relativeIdx + 1} of ${half}</div>
        <button class="bookmark-btn" id="bookmarkBtn" title="Save for later review" style="background:none; border:none; cursor:pointer; padding:4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${isBookmarked ? '#3b82f6' : 'none'}" stroke="${isBookmarked ? '#3b82f6' : '#64748b'}" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      ${imageHtml}
      <div class="question-text" style="font-size:17px;line-height:1.7;margin-bottom:24px; white-space: pre-wrap;">${promptHtml}</div>
      <div class="answer-options" id="answerOptions">${optionsHtml}</div>
      ${!state.reviewMode ? `
        <button class="flag-btn ${flagged}" id="flagBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${state.flagged[idx] ? '#f59e0b' : 'none'}" stroke="${state.flagged[idx] ? '#f59e0b' : 'currentColor'}" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          Mark for Review
        </button>` : ''}`;

    // Update nav label
    dom.questionNavLabel.textContent = `Question ${relativeIdx + 1} of ${half}`;

    // Back button state
    dom.btnBack.disabled = relativeIdx === 0 && state.currentModule === 1;

    if (!state.reviewMode) {
      // Delegated click on container - whole row is clickable
      const answerOptions = document.getElementById('answerOptions');
      if (answerOptions) {
        answerOptions.addEventListener('click', (e) => {
          const option = e.target.closest('.answer-option');
          if (!option) return;
          if (e.target.closest('.strikethrough-btn')) {
            e.stopPropagation();
            option.classList.toggle('strikethrough');
            return;
          }
          if (option.classList.contains('strikethrough')) return;
          
          const i = parseInt(option.dataset.index);
          state.answers[idx] = i;
          renderQuestion();
          saveProgress(); // Auto-save
        });
        
        const sprInput = document.getElementById('sprInput');
        if (sprInput) {
            sprInput.addEventListener('input', (e) => {
                state.answers[idx] = e.target.value.trim();
                saveProgress();
            });
        }
      }

      // Bind flag
      const flagBtn = document.getElementById('flagBtn');
      if (flagBtn) {
        flagBtn.addEventListener('click', () => {
          state.flagged[idx] = !state.flagged[idx];
          renderQuestion();
        });
      }
    }

    // Bind bookmark
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', async () => {
        const qId = q.id;
        const isBookmarked = state.bookmarked.includes(qId);
        const token = localStorage.getItem('token');
        if (!token) return;

        if (isBookmarked) {
          state.bookmarked = state.bookmarked.filter(id => id !== qId);
          await fetch(`/api/bookmarks/${qId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          state.bookmarked.push(qId);
          await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ test_id: state.testId, question_id: qId })
          });
        }
        renderQuestion();
      });
    }

    // Scroll panels to top
    dom.panelLeft.scrollTop = 0;
    document.querySelector('.panel-right').scrollTop = 0;

    // Render MathJax typeset
    if (window.MathJax) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error', err));
    }
  }

  // ---- Navigation ----
  function goToQuestion(idx) {
    if (idx < 0 || idx >= SAT_QUESTIONS.length) return;

    // Check if moving to next module
    const currentQ = SAT_QUESTIONS[idx] || SAT_QUESTIONS[0];
    const currentSec = currentQ ? (currentQ.section ? currentQ.section.toLowerCase() : state.testType) : state.testType;
    const sectionQuestions = SAT_QUESTIONS.filter(x => {
        const sec = x.section ? x.section.toLowerCase() : state.testType;
        return sec === currentSec;
    });
    const firstQIndex = SAT_QUESTIONS.findIndex(x => {
        const sec = x.section ? x.section.toLowerCase() : state.testType;
        return sec === currentSec;
    });
    
    const half = Math.ceil(sectionQuestions.length / 2);
    
    if (idx === firstQIndex + half && state.currentModule === 1 && !state.reviewMode) {
      state.currentModule = 2;

      // Reset timer for Module 2
      state.timerSeconds = 32 * 60;
      localStorage.setItem(`sat-timer-${state.testId}-${state.testType}-${state.currentModule}`, state.timerSeconds);
      if (dom.timerDisplay) {
        dom.timerDisplay.style.color = '';
        dom.timerDisplay.style.animation = '';
      }
      updateTimerDisplay();
      if (state.timerInterval) clearInterval(state.timerInterval);

      dom.transitionOverlay.classList.add('active');
      setTimeout(() => {
        dom.transitionOverlay.classList.remove('active');
        state.currentQuestion = idx;
        renderQuestion();
        startTimer();
      }, 4000);
      return;
    }

    state.currentQuestion = idx;
    renderQuestion();
  }

  function nextQuestion() {
    const q = SAT_QUESTIONS[state.currentQuestion];
    
    const currentSec = q ? (q.section ? q.section.toLowerCase() : state.testType) : state.testType;
    const sectionQuestions = SAT_QUESTIONS.filter(x => {
        const sec = x.section ? x.section.toLowerCase() : state.testType;
        return sec === currentSec;
    });
    const half = Math.ceil(sectionQuestions.length / 2);
    const firstQIndex = SAT_QUESTIONS.findIndex(x => {
        const sec = x.section ? x.section.toLowerCase() : state.testType;
        return sec === currentSec;
    });
    const sectionQIndex = state.currentQuestion - firstQIndex;
    
    // Removed redundant module increment because it's handled in goToQuestion

    if (sectionQIndex === sectionQuestions.length - 1) {
      // Finished the section
      if (state.testType === 'full' && state.currentSection === 'reading') {
          saveProgress(0, false);
          const testId = new URLSearchParams(window.location.search).get('id');
          localStorage.setItem(`sat_full_reading_${testId}`, JSON.stringify(state.answers));
          window.location.href = `break.html?next=test-math.html?id=${testId}%26type=full%26section=math`;
          return;
      } else {
          calculateScore();
          return;
      }
    }

    goToQuestion(state.currentQuestion + 1);
  }

  function calculateScore() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    let correct = 0;
    // Calculate for all questions in state.allQuestions so Full tests get total score
    for (let i = 0; i < state.allQuestions.length; i++) {
      const q = state.allQuestions[i];
      // For SPR, string comparison, for MCQ, int comparison
      const ans = state.answers[i];
      let isCorrect = false;
      if (q.question_type === 'spr') {
          if (ans && ans.toString().trim().toLowerCase() === q.correct_answer_text.toLowerCase()) isCorrect = true;
      } else {
          if (ans === q.correct_answer_index) isCorrect = true;
      }
      if (isCorrect) correct++;
    }
    
    dom.scoreCorrect.textContent = correct;
    dom.scoreTotal.textContent = state.allQuestions.length;
    
    const percentage = correct / state.allQuestions.length;
    const percentDisplay = Math.round(percentage * 100);
    const scorePercentEl = document.getElementById('scorePercent');
    if (scorePercentEl) {
        scorePercentEl.textContent = `${percentDisplay}% Correct`;
    }
    
    const circleBar = document.getElementById('scoreCircleBar');
    if (circleBar) {
        const circumference = 439.8;
        const offset = circumference * (1 - percentage);
        circleBar.style.strokeDashoffset = circumference;
        setTimeout(() => {
            circleBar.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            circleBar.style.strokeDashoffset = offset;
        }, 100);
    }
    
    const feedbackEl = document.getElementById('scoreFeedback');
    if (feedbackEl) {
        if (percentDisplay === 100) {
            feedbackEl.textContent = "👑 God Mode! Absolute Perfection!";
        } else if (percentDisplay >= 90) {
            feedbackEl.textContent = "🌟 Near Flawless! Just minor details left!";
        } else if (percentDisplay >= 75) {
            feedbackEl.textContent = "🔥 High Score! Excellent Performance!";
        } else if (percentDisplay >= 50) {
            feedbackEl.textContent = "⚡ Passing! Over halfway, keep building!";
        } else if (percentDisplay >= 25) {
            feedbackEl.textContent = "📈 Solid start! Practice will double this!";
        } else if (percentDisplay > 0) {
            feedbackEl.textContent = "🌱 Small steps count. Let's hit the error log!";
        } else {
            feedbackEl.textContent = "😅 Zero? Nowhere to go but up from here!";
        }
    }
    
    dom.scoreOverlay.classList.add('active');
    
    // Save final completion
    saveProgress(correct, true);
  }
  
  async function saveProgress(score = 0, completed = false) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const testId = new URLSearchParams(window.location.search).get('id');
    try {
        await fetch('/api/save-progress', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                test_id: testId,
                answers: state.answers,
                score: score,
                completed: completed
            })
        });
    } catch(err) {
        console.error('Failed to save progress', err);
    }
  }

  function prevQuestion() {
    if (state.currentQuestion > 0) {
      goToQuestion(state.currentQuestion - 1);
    }
  }

  // ---- Question Navigator Modal ----
  function renderQuestionGrid() {
    dom.questionGrid.innerHTML = '';
    const half = Math.ceil(SAT_QUESTIONS.length / 2);
    const startIdx = (state.currentModule - 1) * half;
    const endIdx = Math.min(startIdx + half, SAT_QUESTIONS.length);

    for (let i = startIdx; i < endIdx; i++) {
      const btn = document.createElement('button');
      btn.className = 'question-grid-btn';
      btn.textContent = (i - startIdx) + 1;

      if (i === state.currentQuestion) btn.classList.add('current');
      if (state.answers[i] !== null) btn.classList.add('answered');
      if (state.flagged[i]) btn.classList.add('flagged');

      // Review mode coloring
      if (state.reviewMode) {
        const q = SAT_QUESTIONS[i];
        if (state.answers[i] === q.correct_answer_index) btn.classList.add('review-correct');
        else btn.classList.add('review-wrong');
      }

      btn.addEventListener('click', () => {
        document.querySelectorAll('.question-grid-btn.selected-nav').forEach(b => b.classList.remove('selected-nav'));
        btn.classList.add('selected-nav');
        state.selectedNavQuestion = i;
      });

      btn.addEventListener('dblclick', () => {
        goToQuestion(i);
        closeQuestionNav();
      });

      dom.questionGrid.appendChild(btn);
    }
  }

  function openQuestionNav() {
    state.selectedNavQuestion = state.currentQuestion;
    renderQuestionGrid();
    // Select current by default
    const currentBtn = dom.questionGrid.querySelector('.current');
    if (currentBtn) currentBtn.classList.add('selected-nav');

    dom.questionNavOverlay.classList.add('active');
    dom.btnQuestionNav.classList.add('open');
  }

  function closeQuestionNav() {
    dom.questionNavOverlay.classList.remove('active');
    dom.btnQuestionNav.classList.remove('open');
  }

  function goToSelectedNav() {
    if (state.selectedNavQuestion !== null) {
      goToQuestion(state.selectedNavQuestion);
    }
    closeQuestionNav();
  }

  // ---- More Dropdown ----
  function toggleMoreDropdown() {
    dom.moreDropdown.classList.toggle('active');
  }

  function closeMoreDropdown() {
    dom.moreDropdown.classList.remove('active');
  }

  // ---- Highlight Feature ----
  function handleTextSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
      dom.highlightTooltip.classList.remove('visible');
      return;
    }

    // Only show tooltip for text within passage
    const anchor = selection.anchorNode;
    const passageText = document.getElementById('passageText');
    if (!passageText || !passageText.contains(anchor)) {
      dom.highlightTooltip.classList.remove('visible');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    dom.highlightTooltip.style.left = `${rect.left + rect.width / 2 - 40}px`;
    dom.highlightTooltip.style.top = `${rect.top - 50 + window.scrollY}px`;
    dom.highlightTooltip.classList.add('visible');
  }

  function applyHighlight() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    // Get selected color
    const activeColorBtn = document.querySelector('.hl-color-btn.active');
    const colorClass = activeColorBtn ? activeColorBtn.dataset.color : 'yellow';

    span.className = `text-highlight ${colorClass}`;
    let createdEl = span;
    try {
      range.surroundContents(span);
    } catch (e) {
      // If selection crosses element boundaries
      const text = selection.toString();
      const mark = document.createElement('span');
      mark.className = `text-highlight ${colorClass}`;
      mark.textContent = text;
      range.deleteContents();
      range.insertNode(mark);
      createdEl = mark;
    }

    selection.removeAllRanges();
    dom.highlightTooltip.classList.remove('visible');
    return createdEl;
  }

  function removeHighlight() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const anchor = selection.anchorNode;
    const highlightEl = anchor.parentElement?.closest('.text-highlight');
    if (highlightEl) {
      const parent = highlightEl.parentNode;
      while (highlightEl.firstChild) {
        // If there is a note bubble, remove it before unwrapping
        if (highlightEl.firstChild.classList && highlightEl.firstChild.classList.contains('note-bubble')) {
          highlightEl.removeChild(highlightEl.firstChild);
        } else {
          parent.insertBefore(highlightEl.firstChild, highlightEl);
        }
      }
      parent.removeChild(highlightEl);
    }

    selection.removeAllRanges();
    dom.highlightTooltip.classList.remove('visible');
  }

  // ---- Vocabulary Feature ----
  function saveVocabWord() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const word = selection.toString().trim();
    if (!word || word.length > 100) return;

    // Check duplicate
    if (state.vocabWords.some((v) => v.word.toLowerCase() === word.toLowerCase())) {
      showToast('Word already saved!', '#f59e0b');
      return;
    }

    const vocabEntry = {
      word: word,
      question: state.currentQuestion + 1,
      timestamp: Date.now(),
      definitionText: 'Loading definition...'
    };
    state.vocabWords.push(vocabEntry);

    localStorage.setItem('sat-vocab', JSON.stringify(state.vocabWords));
    renderVocabList();
    showToast(`"${word}" saved to vocabulary!`);
    selection.removeAllRanges();

      fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(data => {
          if (Array.isArray(data) && data.length > 0 && data[0] && data[0].meanings && data[0].meanings.length > 0 && data[0].meanings[0].definitions && data[0].meanings[0].definitions.length > 0) {
              vocabEntry.definitionText = data[0].meanings[0].definitions[0].definition;
          } else {
              vocabEntry.definitionText = 'Definition not found.';
          }
          localStorage.setItem('sat-vocab', JSON.stringify(state.vocabWords));
          renderVocabList();
      })
      .catch(() => {
          vocabEntry.definitionText = 'Error loading definition.';
          localStorage.setItem('sat-vocab', JSON.stringify(state.vocabWords));
          renderVocabList();
      });
  }

  function deleteVocabWord(index) {
    state.vocabWords.splice(index, 1);
    localStorage.setItem('sat-vocab', JSON.stringify(state.vocabWords));
    renderVocabList();
  }

  function renderVocabList() {
    if (state.vocabWords.length === 0) {
      dom.vocabEmpty.style.display = 'flex';
      dom.vocabList.style.display = 'none';
    } else {
      dom.vocabEmpty.style.display = 'none';
      dom.vocabList.style.display = 'flex';
      dom.vocabList.innerHTML = state.vocabWords
        .map(
          (v, i) => `
        <li>
          <div style="display:flex; justify-content:space-between; width:100%;">
            <span>
              <span class="vocab-word">${escapeHtml(v.word)}</span>
              <span class="vocab-question-ref">Q${v.question}</span>
            </span>
            <button class="vocab-delete" data-index="${i}" title="Remove">✕</button>
          </div>
          <div class="vocab-def-dash" style="display:block;">${v.definitionText || 'Definition not found. Please delete and re-add.'}</div>
          <a href="https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(v.word.toLowerCase())}" target="_blank" class="vocab-cambridge-link" style="width:100%;">📖 Read on Cambridge Dictionary</a>
        </li>`
        )
        .join('');

      // Bind delete
      dom.vocabList.querySelectorAll('.vocab-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          deleteVocabWord(parseInt(btn.dataset.index));
        });
      });
    }
  }

  function openVocab() {
    renderVocabList();
    dom.vocabOverlay.classList.add('active');
    closeMoreDropdown();
  }

  function closeVocab() {
    dom.vocabOverlay.classList.remove('active');
  }

  // ---- Toast ----
  function showToast(message, color) {
    dom.toastMessage.textContent = message;
    if (color) {
      dom.toast.querySelector('.toast-icon').style.background = color;
    } else {
      dom.toast.querySelector('.toast-icon').style.background = '#22c55e';
    }
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2500);
  }

  // ---- Utilities ----
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Panel Resizer ----
  function initPanelResizer() {
    const divider = $('#panelDivider');
    const left = dom.panelLeft;
    const right = document.querySelector('.panel-right');
    const wrapper = document.querySelector('.content-wrapper');
    let isResizing = false;

    divider.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const pct = ((e.clientX - wrapperRect.left) / wrapperRect.width) * 100;
      if (pct > 20 && pct < 80) {
        left.style.flex = `0 0 ${pct}%`;
        right.style.flex = `0 0 ${100 - pct - 1}%`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // ---- Keyboard Shortcuts ----
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {


      // Arrow keys for navigation (when not in text field)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && !e.ctrlKey) {
        // Only navigate if question nav is not open
        if (!dom.questionNavOverlay.classList.contains('active')) {
          nextQuestion();
        }
      }
      if (e.key === 'ArrowLeft' && !e.ctrlKey) {
        if (!dom.questionNavOverlay.classList.contains('active')) {
          prevQuestion();
        }
      }

      // Escape closes modals
      if (e.key === 'Escape') {
        closeQuestionNav();
        closeMoreDropdown();
      }

      // Quick answer with A, B, C, D
      if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        const letterMap = { a: 0, b: 1, c: 2, d: 3 };
        if (letterMap.hasOwnProperty(e.key.toLowerCase())) {
          if (!dom.questionNavOverlay.classList.contains('active')) {
            state.answers[state.currentQuestion] = letterMap[e.key.toLowerCase()];
            renderQuestion();
          }
        }
      }
    });
  }

  // ---- Event Bindings ----
  function initEvents() {
    // Timer
    dom.btnHideTimer.addEventListener('click', toggleTimer);

    // More dropdown
    dom.btnMore.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMoreDropdown();
    });
    document.addEventListener('click', (e) => {
      if (!dom.moreDropdown.contains(e.target) && e.target !== dom.btnMore) {
        closeMoreDropdown();
      }
    });

    // Highlight mode
    dom.btnAnnotate.addEventListener('click', () => {
      state.annotateMode = !state.annotateMode;
      document.body.classList.toggle('annotate-mode', state.annotateMode);
      closeMoreDropdown();
      showToast(state.annotateMode ? 'Highlight mode ON' : 'Highlight mode OFF');
    });



    // Exit to Dashboard
    if (dom.btnExitTest) {
      dom.btnExitTest.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
      });
    }

    // Directions
    dom.directionsClose.addEventListener('click', () => {
      dom.directionsBanner.classList.add('hidden');
    });

    // Navigation
    const btnCalc = document.getElementById('btnCalculator');
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
    dom.btnNext.addEventListener('click', nextQuestion);
    dom.btnBack.addEventListener('click', prevQuestion);

    // Question Navigator
    dom.btnQuestionNav.addEventListener('click', () => {
      if (dom.questionNavOverlay.classList.contains('active')) {
        closeQuestionNav();
      } else {
        openQuestionNav();
      }
    });
    dom.navModalClose.addEventListener('click', closeQuestionNav);
    dom.questionNavOverlay.addEventListener('click', (e) => {
      if (e.target === dom.questionNavOverlay) closeQuestionNav();
    });
    dom.btnGoTo.addEventListener('click', goToSelectedNav);

    // Text selection -> highlight tooltip
    document.addEventListener('mouseup', () => {
      setTimeout(handleTextSelection, 10);
    });
    document.addEventListener('mousedown', (e) => {
      if (!dom.highlightTooltip.contains(e.target)) {
        dom.highlightTooltip.classList.remove('visible');
      }
    });

    dom.tooltipHighlight.addEventListener('click', applyHighlight);
    dom.tooltipRemove.addEventListener('click', removeHighlight);

    // Note Feature
    let activeHighlightForNote = null;

    if (dom.btnHlNote) {
      dom.btnHlNote.addEventListener('click', () => {
        const createdEl = applyHighlight();
        if (createdEl) {
          activeHighlightForNote = createdEl;
          dom.annotationPopup.classList.add('active');
          dom.annotationTextarea.focus();
        }
      });
    }

    const closeAnnotation = () => {
      if (dom.annotationPopup) dom.annotationPopup.classList.remove('active');
      if (dom.annotationTextarea) dom.annotationTextarea.value = '';
      activeHighlightForNote = null;
    };

    if (dom.annotationClose) dom.annotationClose.addEventListener('click', closeAnnotation);
    if (dom.annotationCancel) dom.annotationCancel.addEventListener('click', closeAnnotation);

    if (dom.annotationSave) {
      dom.annotationSave.addEventListener('click', () => {
        const text = dom.annotationTextarea.value.trim();
        if (text && activeHighlightForNote) {
          activeHighlightForNote.classList.add('has-note');
          const bubble = document.createElement('div');
          bubble.className = 'note-bubble';

          const textSpan = document.createElement('span');
          textSpan.className = 'note-text';
          textSpan.textContent = text;

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'note-delete-btn';
          deleteBtn.innerHTML = '✕';
          deleteBtn.title = 'Delete note';

          const currentHighlight = activeHighlightForNote;
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentHighlight.classList.remove('has-note');
            bubble.remove();
          });

          bubble.appendChild(textSpan);
          bubble.appendChild(deleteBtn);
          currentHighlight.appendChild(bubble);
        }
        closeAnnotation();
      });
    }

    // Highlight colors
    document.querySelectorAll('.hl-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.hl-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Score Screen Buttons
    if (dom.btnScoreHome) {
      dom.btnScoreHome.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
      });
    }
    
    // Error Log
    if (dom.btnScoreReview) {
      dom.btnScoreReview.addEventListener('click', () => {
        dom.scoreOverlay.classList.remove('active');
        generateErrorLog();
      });
    }

    if (dom.btnCloseErrorLog) {
      dom.btnCloseErrorLog.addEventListener('click', () => {
        dom.errorLogOverlay.style.display = 'none';
        dom.scoreOverlay.classList.add('active');
      });
    }

    if (dom.btnExportPDF) {
      dom.btnExportPDF.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // ---- Error Log Generator ----
  function generateErrorLog() {
    dom.errorLogContent.innerHTML = '';
    let errorCount = 0;

    for (let i = 0; i < SAT_QUESTIONS.length; i++) {
      const q = SAT_QUESTIONS[i];
      const userAnswer = state.answers[i];
      const correctAnswer = q.correct_answer_index;

      if (userAnswer !== correctAnswer) {
        errorCount++;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'error-item';

        let parsedOpts = q.options;
        if (typeof parsedOpts === 'string') {
          try { parsedOpts = JSON.parse(parsedOpts); } catch(e) { parsedOpts = []; }
        }

        const rawUserAns = (userAnswer !== undefined && userAnswer !== null && parsedOpts) ? parsedOpts[userAnswer] : null;
        const rawCorrectAns = (parsedOpts && correctAnswer !== undefined && correctAnswer !== null) ? parsedOpts[correctAnswer] : null;

        const resolvedUserAns = rawUserAns ? resolveImageUrl(rawUserAns) : null;
        const resolvedCorrectAns = rawCorrectAns ? resolveImageUrl(rawCorrectAns) : null;

        const userAnswerText = (resolvedUserAns !== undefined && resolvedUserAns !== null)
          ? (isImageUrl(resolvedUserAns) ? `<img src="${resolvedUserAns}" style="max-height: 80px; object-fit: contain; display: block;" />` : rawUserAns)
          : 'No Answer Selected';

        const correctAnswerText = (resolvedCorrectAns !== undefined && resolvedCorrectAns !== null)
          ? (isImageUrl(resolvedCorrectAns) ? `<img src="${resolvedCorrectAns}" style="max-height: 80px; object-fit: contain; display: block;" />` : rawCorrectAns)
          : '';

        console.log(`[Error Log Debug] Question ${i + 1}: type=mcq, userAnswer=${userAnswer}, db_correct_index=${correctAnswer}, resolvedUserText=${userAnswerText}, resolvedCorrectText=${correctAnswerText}`);

        let imageHtml = '';
        if (q.image_url && isImageUrl(q.image_url)) {
            const resolved = resolveImageUrl(q.image_url);
            imageHtml = `<img src="${resolved}" class="question-image" style="max-height: 200px;" alt="Question Image" />`;
        }

        let promptHtml = q.prompt;
        if (imageHtml) {
            if (promptHtml.includes('[image]')) {
                promptHtml = promptHtml.replace('[image]', imageHtml);
                imageHtml = '';
            } else if (promptHtml.includes('{{image}}')) {
                promptHtml = promptHtml.replace('{{image}}', imageHtml);
                imageHtml = '';
            }
        }
        promptHtml = promptHtml.replace(/\\\)\s+\\\(/g, '\\)<br>\\(');

        itemDiv.innerHTML = `
          <div class="error-qnum">Question ${i + 1}</div>
          ${q.passage ? `<div class="error-passage">${q.passage}</div>` : ''}
          ${imageHtml}
          <div class="error-prompt" style="white-space: pre-wrap;">${promptHtml}</div>
          <div class="error-answers">
            <div class="error-ans-row wrong">
              <span class="error-ans-icon">✗</span> 
              <span><strong>Your Answer:</strong> ${userAnswerText}</span>
            </div>
            <div class="error-ans-row correct">
              <span class="error-ans-icon">✓</span> 
              <span><strong>Correct Answer:</strong> ${correctAnswerText}</span>
            </div>
          </div>
          <button class="btn-explain-ai" data-index="${i}">✨ Explain with AI</button>
          <div id="ai-explanation-${i}" style="display:none;" class="ai-explanation-box"></div>
        `;
        dom.errorLogContent.appendChild(itemDiv);
      }
    }

    if (errorCount === 0) {
      dom.errorLogContent.innerHTML = '<div style="padding:20px;text-align:center;">Perfect Score! No errors found.</div>';
    }

    // Bind AI Explain buttons
    const aiButtons = dom.errorLogContent.querySelectorAll('.btn-explain-ai');
    aiButtons.forEach(btn => {
        btn.addEventListener('click', handleAIExplain);
    });
    
    dom.errorLogOverlay.style.display = 'flex';
  }

  async function handleAIExplain(e) {
      const btn = e.currentTarget;
      const index = btn.getAttribute('data-index');
      const box = document.getElementById(`ai-explanation-${index}`);
      
      btn.disabled = true;
      btn.innerHTML = '✨ Thinking...';
      box.style.display = 'block';
      box.innerHTML = 'AI is analyzing your answer...';

      const q = SAT_QUESTIONS[index];
      const token = localStorage.getItem('token');
      
      let parsedOpts = q.options;
      if (typeof parsedOpts === 'string') {
          try { parsedOpts = JSON.parse(parsedOpts); } catch(err) { parsedOpts = []; }
      }
      
      const userAnswerText = state.answers[index] !== null ? parsedOpts[state.answers[index]] : 'No Answer Selected';
      const correctAnswerText = parsedOpts[q.correct_answer_index];

      try {
          const res = await fetch('/api/explain', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  question: q.prompt,
                  passage: q.passage,
                  options: parsedOpts,
                  userAnswer: userAnswerText,
                  correctAnswer: correctAnswerText
              })
          });

          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          box.innerHTML = data.explanation.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          if (window.MathJax) { window.MathJax.typesetPromise(); }
          btn.style.display = 'none'; // hide button after success
      } catch (err) {
          console.error(err);
          box.innerHTML = 'Failed to get explanation. Please try again.';
          btn.disabled = false;
          btn.innerHTML = '✨ Explain with AI';
      }
  }

  // ---- Init ----
  async function init() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    const testId = new URLSearchParams(window.location.search).get('id');
    if (!testId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    try {
        // Fetch test type if missing in URL
        let actualTestType = state.testType;
        if (!new URLSearchParams(window.location.search).has('type')) {
            const testsRes = await fetch('/api/tests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (testsRes.ok) {
                const testsData = await testsRes.json();
                const currentTest = testsData.find(t => t.id.toString() === testId);
                if (currentTest) {
                    actualTestType = currentTest.type.toLowerCase();
                    state.testType = actualTestType === 'full' ? 'full' : (actualTestType.includes('math') ? 'math' : 'reading');
                    if (!new URLSearchParams(window.location.search).has('section')) {
                        state.currentSection = state.testType === 'full' ? 'reading' : state.testType;
                    }
                }
            }
        }

        const response = await fetch(`/api/tests/${testId}/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            window.location.href = 'dashboard.html';
            return;
        }
        
        const data = await response.json();
        
        let filteredQuestions = data.questions;
        if (state.testType === 'full') {
            filteredQuestions = data.questions.filter(q => {
                const sec = q.section ? q.section.toLowerCase() : 'reading';
                return sec === state.currentSection;
            });
        }
        
        SAT_QUESTIONS = filteredQuestions;
        state.allQuestions = data.questions;
        
        const numQ = SAT_QUESTIONS.length;
        state.answers = new Array(numQ).fill(null);
        state.flagged = new Array(numQ).fill(false);
        
        // Fetch previous progress
        const progRes = await fetch(`/api/progress/${testId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (progRes.ok) {
            const progData = await progRes.json();
            if (progData && progData.answers && progData.completed !== 1) {
                const savedAnswers = JSON.parse(progData.answers);
                for (let i = 0; i < savedAnswers.length && i < numQ; i++) {
                    state.answers[i] = savedAnswers[i];
                }
            } else if (progData && progData.completed === 1) {
                localStorage.removeItem(`sat-resume-${testId}-${state.testType}`);
                localStorage.removeItem(`sat-timer-${testId}-${state.testType}-1`);
                localStorage.removeItem(`sat-timer-${testId}-${state.testType}-2`);
            }
        }
        
        // Restore currentQuestion and currentModule if they exist
        const savedResume = localStorage.getItem(`sat-resume-${testId}-${state.testType}`);
        let resumeFound = false;
        if (savedResume) {
            try {
                const s = JSON.parse(savedResume);
                if (s.currentModule) state.currentModule = s.currentModule;
                if (s.currentQuestion !== undefined) {
                    state.currentQuestion = s.currentQuestion;
                    resumeFound = true;
                }
            } catch(e) {}
        }
        
        if (!resumeFound) {
            // Find starting question for the current section
            const firstQIndex = SAT_QUESTIONS.findIndex(q => {
                 const sec = q.section ? q.section.toLowerCase() : state.testType;
                 return sec === state.currentSection;
            });
            if (firstQIndex !== -1) {
                 state.currentQuestion = firstQIndex;
            }
        }
        // Fetch bookmarks
        const bkRes = await fetch(`/api/tests/${testId}/bookmarks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bkRes.ok) {
            state.bookmarked = await bkRes.json();
        }

        renderQuestion();
        
        const savedTimer = localStorage.getItem(`sat-timer-${testId}-${state.testType}-${state.currentModule}`);
        if (savedTimer !== null) {
            state.timerSeconds = parseInt(savedTimer, 10);
        }

        startTimer();
        initEvents();
        initKeyboardShortcuts();
        initPanelResizer();
    } catch (err) {
        console.error(err);
        alert('Error loading test. Please try again.');
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
