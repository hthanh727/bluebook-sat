// ====================================
// Bluebook SAT – Math Application Logic
// ====================================
(function () {
  'use strict';

  // ---- State ----
  let SAT_MATH_QUESTIONS = [];

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

  const state = {
    testId: new URLSearchParams(window.location.search).get('id'),
    currentQuestion: 0,
    currentModule: 1,
    answers: [],
    flagged: [],
    timerSeconds: 35 * 60,
    timerHidden: false,
    timerInterval: null,
    reviewMode: false,
    selectedNavQuestion: null,
    bookmarked: [],
    practiceMode: false,
    questionSubmitted: [],
  };

  // ---- DOM References ----
  const $ = (sel) => document.querySelector(sel);

  const dom = {
    timerDisplay: $('#timerDisplay'),
    timerContainer: $('#timerContainer'),
    btnHideTimer: $('#btnHideTimer'),
    btnMore: $('#btnMore'),
    moreDropdown: $('#moreDropdown'),
    btnExitTest: $('#btnExitTest'),
    btnHelp: $('#btnHelp'),
    questionContainer: $('#questionContainer'),
    studentName: $('#studentName'),
    btnBack: $('#btnBack'),
    btnNext: $('#btnNext'),
    btnQuestionNav: $('#btnQuestionNav'),
    questionNavLabel: $('#questionNavLabel'),
    questionNavOverlay: $('#questionNavOverlay'),
    questionNavModal: $('#questionNavModal'),
    navModalClose: $('#navModalClose'),
    questionGrid: $('#questionGrid'),
    btnGoTo: $('#btnGoTo'),
    practiceToggle: $('#practiceToggle'),
    toast: $('#toast'),
    toastMessage: $('#toastMessage'),
    panelRight: $('#panelRight'),
    btnReference: $('#btnReference'),
    refOverlay: $('#refOverlay'),
    refClose: $('#refClose'),
    btnCalculator: $('#btnCalculator'),
    calcOverlay: $('#calcOverlay'),
    calcClose: $('#calcClose'),
    calcModal: $('#calcModal'),
    calcHeader: $('#calcHeader'),
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
    if (dom.timerInterval) clearInterval(dom.timerInterval);
    dom.timerInterval = setInterval(() => {
      if (state.practiceMode) {
        const now = new Date();
        const gmt7String = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dom.timerDisplay.textContent = gmt7String;
        return;
      }
      if (!state.timerHidden) {
        state.timerSeconds--;
        updateTimerDisplay();
        if (state.timerSeconds <= 0) {
          clearInterval(dom.timerInterval);
          const half = Math.ceil(SAT_MATH_QUESTIONS.length / 2);
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
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const m = Math.floor(state.timerSeconds / 60);
    const s = state.timerSeconds % 60;
    dom.timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (state.timerSeconds <= 300) dom.timerDisplay.style.color = '#fbbf24';
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

  function renderQuestion() {
    if (!SAT_MATH_QUESTIONS || SAT_MATH_QUESTIONS.length === 0) return;
    const q = SAT_MATH_QUESTIONS[state.currentQuestion];
    if (!q) return;

    localStorage.setItem(`sat-resume-${state.testId}-${state.testType}`, JSON.stringify({ currentQuestion: state.currentQuestion, currentModule: state.currentModule }));

    const idx = state.currentQuestion;
    const letters = ['A', 'B', 'C', 'D'];
    let optionsHtml = '';
    
    if (q.question_type !== 'spr') {
      let parsedOpts = q.options;
      if (typeof parsedOpts === 'string') {
        try { parsedOpts = JSON.parse(parsedOpts); } catch(e) { parsedOpts = []; }
      }

      if (Array.isArray(parsedOpts)) {
        parsedOpts.forEach((opt, i) => {
          let reviewClass = '';
          if (state.reviewMode || (state.practiceMode && state.questionSubmitted[idx])) {
            if (i === q.correct_answer_index) {
              reviewClass = 'review-correct';
            } else if (state.answers[idx] === i && i !== q.correct_answer_index) {
              reviewClass = 'review-wrong';
            }
          }
          const selected = state.answers[idx] === i && !state.reviewMode ? 'selected' : '';
          const resolvedOpt = resolveImageUrl(opt);
          const optionContent = isImageUrl(resolvedOpt)
            ? `<img src="${resolvedOpt}" class="option-image" style="max-height: 120px; object-fit: contain; display: block;" alt="Option ${letters[i]}" />`
            : convertMarkdownTablesToHtml(opt);
          optionsHtml += `
            <div class="answer-option ${selected} ${reviewClass}" data-index="${i}" id="answer-option-${i}">
              <span class="answer-letter">${letters[i]}</span>
              <span class="answer-text">${optionContent}</span>
            </div>`;
        });
      }
    }

    const flagged = state.flagged[idx] ? 'flagged' : '';
    const half = Math.ceil(SAT_MATH_QUESTIONS.length / 2);
    const relativeIdx = state.currentModule === 1 ? state.currentQuestion : state.currentQuestion - half;
    const moduleLabel = state.currentModule === 1 ? 'Module 1' : 'Module 2';

    let imageHtml = '';
    if (q.image_url && isImageUrl(q.image_url)) {
      const resolved = resolveImageUrl(q.image_url);
      imageHtml = `<img src="${resolved}" class="question-image" loading="eager" fetchpriority="high" alt="Question Image" />`;
    }

function convertMarkdownTablesToHtml(text) {
    if (!text || typeof text !== 'string') return text;
    let res = text;
    if (res.includes('|---')) {
        res = res.replace(/\|\|/g, '|\n|');
        const tableRegex = /(?:\|[^\n]+\|\r?\n?)+(?:\|[-:\s|]+\|\r?\n?)(?:\|[^\n]+\|\r?\n?)+/g;
        res = res.replace(tableRegex, (match) => {
            const lines = match.trim().split(/\r?\n/).filter(line => line.trim().startsWith('|'));
            if (lines.length < 3) return match;
            const parseRow = (rowStr) => rowStr.split('|').slice(1, -1).map(cell => cell.trim());
            const headers = parseRow(lines[0]);
            const bodyRows = lines.slice(2).map(parseRow);
            let html = '<table class="sat-table"><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
            bodyRows.forEach(row => {
                html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
            });
            html += '</tbody></table>';
            return html;
        });
    }
    // Strip hardcoded inline styles from tables so CSS controls dark/light mode
    res = res.replace(/<(table|thead|tbody|tr|th|td)([^>]*)\s+style="[^"]*"/gi, '<$1$2');
    return res;
}

    let promptHtml = convertMarkdownTablesToHtml(q.prompt);
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

    const isBookmarked = state.bookmarked.includes(q.id);

    const questionHeaderHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
          ${moduleLabel} · Question ${relativeIdx + 1} of ${half}
        </div>
        <button class="bookmark-btn" id="bookmarkBtn" title="Save for later review" style="background:none; border:none; cursor:pointer; padding:4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${isBookmarked ? '#3b82f6' : 'none'}" stroke="${isBookmarked ? '#3b82f6' : '#64748b'}" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
    `;

    const flagBtnHtml = !state.reviewMode ? `
        <button class="flag-btn ${flagged}" id="flagBtn" style="margin-top:32px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${state.flagged[idx] ? '#f59e0b' : 'none'}" stroke="${state.flagged[idx] ? '#f59e0b' : 'currentColor'}" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          Mark for Review
        </button>` : '';

    if (q.question_type === 'spr') {
        dom.questionContainer.classList.add('spr-mode');
        if (dom.panelRight) dom.panelRight.classList.add('spr-active');
        const directionsHtml = `
            <div class="spr-directions">
                <h4>Student-produced response directions</h4>
                <ul>
                    <li>If you find <strong>more than one correct answer</strong>, enter only one answer.</li>
                    <li>You can enter up to 5 characters for a <strong>positive</strong> answer and up to 6 characters (including the negative sign) for a <strong>negative</strong> answer.</li>
                    <li>If your answer is a <strong>fraction</strong> that doesn't fit in the provided space, enter the decimal equivalent.</li>
                    <li>If your answer is a <strong>decimal</strong> that doesn't fit in the provided space, enter it by truncating or rounding at the fourth digit.</li>
                    <li>If your answer is a <strong>mixed number</strong> (such as 3 1/2), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li>
                    <li>Don't enter <strong>symbols</strong> such as a percent sign, comma, or dollar sign.</li>
                </ul>
            </div>
        `;
        
        let reviewHtml = '';
        if (state.reviewMode || (state.practiceMode && state.questionSubmitted[idx])) {
            const isCorrect = (state.answers[idx] || '').toString().trim() === (q.correct_answer_text || '').toString().trim();
            reviewHtml = `
               <div style="margin-top: 24px; padding: 16px; border-radius: 8px; border: 1px solid ${isCorrect ? '#10b981' : '#ef4444'}; background: ${isCorrect ? '#ecfdf5' : '#fef2f2'};">
                   <div style="font-size: 14px; margin-bottom: 8px;">
                       <span style="font-weight: 600; color: ${isCorrect ? '#10b981' : '#ef4444'};">Your Answer:</span> 
                       ${state.answers[idx] || '<span style="font-style:italic;color:#94a3b8">No Answer Provided</span>'}
                   </div>
                   <div style="font-size: 14px;">
                       <span style="font-weight: 600; color: #10b981;">Correct Answer:</span> 
                       ${q.correct_answer_text}
                   </div>
               </div>
            `;
        }

        dom.questionContainer.innerHTML = `
            <div class="spr-layout">
                <div class="spr-left">
                    ${directionsHtml}
                </div>
                <div class="spr-right">
                    ${questionHeaderHtml}
                    ${imageHtml}
                    <div class="question-text" style="font-size:17px;line-height:1.7;margin-bottom:24px; white-space: pre-wrap;">${promptHtml}</div>
                    <div class="spr-input-container">
                        <input type="text" id="sprAnswerInput" class="spr-input" placeholder="" maxlength="6" value="${state.answers[idx] || ''}" ${(state.reviewMode || (state.practiceMode && state.questionSubmitted[idx])) ? 'disabled' : ''}>
                        <div class="spr-preview">Answer Preview: <span id="sprAnswerPreview">${state.answers[idx] || ''}</span></div>
                    </div>
                    ${reviewHtml}
                    ${flagBtnHtml}
                </div>
            </div>
        `;
    } else {
        dom.questionContainer.classList.remove('spr-mode');
        if (dom.panelRight) dom.panelRight.classList.remove('spr-active');
        dom.questionContainer.innerHTML = `
          ${questionHeaderHtml}
          ${imageHtml}
          <div class="question-text" style="font-size:17px;line-height:1.7;margin-bottom:24px; white-space: pre-wrap;">${promptHtml}</div>
          <div class="answer-options" id="answerOptions">${optionsHtml}</div>
          ${flagBtnHtml}
        `;
    }

    // Update nav label
    dom.questionNavLabel.textContent = `Question ${relativeIdx + 1} of ${half}`;
    if (dom.btnBack) dom.btnBack.disabled = relativeIdx === 0;

    // Next button text based on Practice Mode
    if (state.practiceMode && !state.questionSubmitted[idx]) {
        dom.btnNext.textContent = 'Submit';
    } else {
        dom.btnNext.textContent = 'Next';
    }

    if (!state.reviewMode && !(state.practiceMode && state.questionSubmitted[idx])) {
      // Delegated click on container - whole row is clickable
      const answerOptions = document.getElementById('answerOptions');
      if (answerOptions) {
        answerOptions.addEventListener('click', (e) => {
          const option = e.target.closest('.answer-option');
          if (!option) return;
          const i = parseInt(option.dataset.index);
          state.answers[idx] = i;
          renderQuestion();
          saveProgress(); // Auto-save
        });
      }

      const sprInput = document.getElementById('sprAnswerInput');
      if (sprInput) {
          sprInput.addEventListener('input', (e) => {
              const val = e.target.value;
              state.answers[idx] = val;
              document.getElementById('sprAnswerPreview').textContent = val;
              saveProgress(); // Auto-save
          });
      }

      // Bind flag
      const flagBtn = document.getElementById('flagBtn');
      if (flagBtn) {
        flagBtn.addEventListener('click', () => {
          state.flagged[idx] = !state.flagged[idx];
          renderQuestion();
        });
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
    }

    if (dom.panelRight) dom.panelRight.scrollTop = 0;

    // Render MathJax typeset
    if (window.MathJax) {
      MathJax.typesetPromise([dom.questionContainer]).catch((err) => console.log('MathJax error', err));
    }
  }

  // ---- Navigation ----
  function goToQuestion(idx) {
    if (idx < 0 || idx >= SAT_MATH_QUESTIONS.length) return;

    // Module transition
    const half = Math.ceil(SAT_MATH_QUESTIONS.length / 2);
    if (idx === half && state.currentModule === 1 && !state.reviewMode) {
      state.currentModule = 2;
      
      // Reset timer for Module 2
      state.timerSeconds = 35 * 60;
      if (dom.timerDisplay) {
        dom.timerDisplay.style.color = '';
        dom.timerDisplay.style.animation = '';
      }
      updateTimerDisplay();
      if (dom.timerInterval) clearInterval(dom.timerInterval);

      dom.transitionOverlay.classList.add('active');
      setTimeout(() => {
        dom.transitionOverlay.classList.remove('active');
        state.currentQuestion = idx;
        renderQuestion();
        startTimer();
      }, 4500);
      return;
    }

    state.currentQuestion = idx;
    renderQuestion();
  }

  function nextQuestion() {
    if (state.practiceMode && !state.questionSubmitted[state.currentQuestion]) {
      state.questionSubmitted[state.currentQuestion] = true;
      localStorage.setItem(`sat-practice-submitted-${state.testId}`, JSON.stringify(state.questionSubmitted));
      renderQuestion();
      return;
    }
    if (state.currentQuestion >= SAT_MATH_QUESTIONS.length - 1) {
      calculateScore();
      return;
    }
    goToQuestion(state.currentQuestion + 1);
  }

  function prevQuestion() {
    const half = Math.ceil(SAT_MATH_QUESTIONS.length / 2);
    const minIdx = state.currentModule === 2 ? half : 0;
    if (state.currentQuestion > minIdx) {
      goToQuestion(state.currentQuestion - 1);
    }
  }

  function calculateScore() {
    if (dom.timerInterval) clearInterval(dom.timerInterval);
    localStorage.removeItem(`sat-practice-mode-${state.testId}`);
    localStorage.removeItem(`sat-practice-submitted-${state.testId}`);
    
    const actualTestType = new URLSearchParams(window.location.search).get('type');
    const testId = new URLSearchParams(window.location.search).get('id');
    
    let questionsToScore = SAT_MATH_QUESTIONS;
    let answersToScore = state.answers;
    
    if (actualTestType === 'full' && state.allQuestions) {
        questionsToScore = [...state.allQuestions].sort((a, b) => {
            const secA = a.section ? a.section.toLowerCase() : 'math';
            const secB = b.section ? b.section.toLowerCase() : 'math';
            if (secA === 'reading' && secB === 'math') return -1;
            if (secA === 'math' && secB === 'reading') return 1;
            return 0;
        });
        
        const readingAnswersStr = localStorage.getItem(`sat_full_reading_${testId}`);
        let readingAnswers = [];
        try { readingAnswers = JSON.parse(readingAnswersStr) || []; } catch(e) {}
        
        answersToScore = [];
        let rIndex = 0;
        let mIndex = 0;
        for (let q of questionsToScore) {
            const sec = q.section ? q.section.toLowerCase() : 'math';
            if (sec === 'reading') {
                answersToScore.push(readingAnswers[rIndex++] || null);
            } else {
                answersToScore.push(state.answers[mIndex++] || null);
            }
        }
    }
    
    let correct = 0;
    for (let i = 0; i < questionsToScore.length; i++) {
      const q = questionsToScore[i];
      const userAnswer = answersToScore[i];
      if (q.question_type === 'spr') {
          const userAns = (userAnswer || '').toString().trim();
          const correctAns = (q.correct_answer_text || '').toString().trim();
          if (userAns !== '' && userAns === correctAns) {
              correct++;
          }
      } else {
          if (userAnswer === q.correct_answer_index) {
              correct++;
          }
      }
    }
    
    dom.scoreCorrect.textContent = correct;
    dom.scoreTotal.textContent = questionsToScore.length;
    
    if (actualTestType === 'full') {
        const titleEl = document.querySelector('.score-title');
        if (titleEl) titleEl.textContent = 'Full Mock Test Completed';
        const errTitleEl = document.querySelector('.error-log-title');
        if (errTitleEl) errTitleEl.textContent = 'Error Log (Reading & Math)';
    }
    
    const percentage = correct / questionsToScore.length;
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

  // ---- Question Navigator Modal ----
  function renderQuestionGrid() {
    dom.questionGrid.innerHTML = '';
    const half = Math.ceil(SAT_MATH_QUESTIONS.length / 2);
    const startIdx = (state.currentModule - 1) * half;
    const endIdx = Math.min(startIdx + half, SAT_MATH_QUESTIONS.length);

    for (let i = startIdx; i < endIdx; i++) {
      const btn = document.createElement('button');
      btn.className = 'question-grid-btn';
      btn.textContent = (i - startIdx) + 1;

      if (i === state.currentQuestion) btn.classList.add('current');
      if (state.answers[i] !== null) btn.classList.add('answered');
      if (state.flagged[i]) btn.classList.add('flagged');

      // Review mode coloring
      if (state.reviewMode) {
        const q = SAT_MATH_QUESTIONS[i];
        if (state.answers[i] === q.correct_answer_index) {
          btn.classList.add('review-correct');
        } else {
          btn.classList.add('review-wrong');
        }
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
  }

  function closeQuestionNav() {
    dom.questionNavOverlay.classList.remove('active');
  }

  function goToSelectedNav() {
    if (state.selectedNavQuestion !== null) {
      goToQuestion(state.selectedNavQuestion);
      closeQuestionNav();
    }
  }

  // ---- More Dropdown ----
  function toggleMoreDropdown() {
    dom.moreDropdown.classList.toggle('open');
  }

  function closeMoreDropdown() {
    dom.moreDropdown.classList.remove('open');
  }

  // ---- Toast ----
  function showToast(msg, color) {
    dom.toastMessage.textContent = msg;
    if (color) {
      dom.toast.querySelector('.toast-icon').style.background = color;
    } else {
      dom.toast.querySelector('.toast-icon').style.background = '#22c55e';
    }
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 2500);
  }

  // ---- Draggable Modal ----
  function initDraggable(handle, modal) {
    if (!handle || !modal) return;
    let dragging = false, startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = modal.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      modal.style.left = `${startLeft + dx}px`;
      modal.style.top = `${startTop + dy}px`;
      modal.style.transform = 'none';
      modal.style.position = 'fixed';
    });

    document.addEventListener('mouseup', () => { dragging = false; });
  }

  // ---- Keyboard Shortcuts ----
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && !e.ctrlKey) {
        if (!dom.questionNavOverlay.classList.contains('active')) nextQuestion();
      }
      if (e.key === 'ArrowLeft' && !e.ctrlKey) {
        if (!dom.questionNavOverlay.classList.contains('active')) prevQuestion();
      }

      if (e.key === 'Escape') {
        closeQuestionNav();
        closeMoreDropdown();
        if (dom.refOverlay) dom.refOverlay.classList.remove('active');
        if (dom.calcOverlay) dom.calcOverlay.classList.remove('active');
        if (dom.scoreOverlay) dom.scoreOverlay.classList.remove('active');
      }

      // Quick answer
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && !state.reviewMode) {
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
    // Practice Mode Toggle
    if (dom.practiceToggle) {
      dom.practiceToggle.addEventListener('click', () => {
        if (!state.practiceMode) {
          state.practiceMode = true;
          dom.practiceToggle.classList.add('active');
          dom.practiceToggle.disabled = true;
          localStorage.setItem(`sat-practice-mode-${state.testId}`, 'true');
          renderQuestion();
          if (dom.timerInterval) {
            const now = new Date();
            const gmt7String = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            dom.timerDisplay.textContent = gmt7String;
          }
        }
      });
    }

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

    // Exit to Dashboard
    if (dom.btnExitTest) {
      dom.btnExitTest.addEventListener('click', () => {
        if (confirm('Exit to dashboard? Your progress will be lost.')) {
          window.location.href = '/dashboard';
        }
      });
    }

    // Help
    if (dom.btnHelp) {
      dom.btnHelp.addEventListener('click', () => {
        showToast('Shortcuts: ← → navigate, A/B/C/D to answer');
        closeMoreDropdown();
      });
    }

    // Navigation
    dom.btnNext.addEventListener('click', nextQuestion);
    if (dom.btnBack) dom.btnBack.addEventListener('click', prevQuestion);

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

    // Reference Modal
    if (dom.btnReference) {
      dom.btnReference.addEventListener('click', () => {
        dom.refOverlay.classList.add('active');
        closeMoreDropdown();
      });
      dom.refClose.addEventListener('click', () => dom.refOverlay.classList.remove('active'));
      dom.refOverlay.addEventListener('click', (e) => {
        if (e.target === dom.refOverlay) dom.refOverlay.classList.remove('active');
      });
    }

    // Calculator Modal
    if (dom.btnCalculator) {
      dom.btnCalculator.addEventListener('click', () => {
        dom.calcOverlay.classList.toggle('active');
        closeMoreDropdown();
      });
      dom.calcClose.addEventListener('click', () => dom.calcOverlay.classList.remove('active'));
    }

    // Draggable modals
    initDraggable($('#refHeader'), $('#refOverlay .modal-window'));
    initDraggable($('#calcHeader'), dom.calcModal);

    // Score Screen Buttons
    if (dom.btnScoreHome) {
      dom.btnScoreHome.addEventListener('click', () => {
        window.location.href = '/dashboard';
      });
    }
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

    const actualTestType = new URLSearchParams(window.location.search).get('type');
    const testId = new URLSearchParams(window.location.search).get('id');
    
    let questionsToLog = SAT_MATH_QUESTIONS;
    let answersToLog = state.answers;
    
    if (actualTestType === 'full' && state.allQuestions) {
        questionsToLog = [...state.allQuestions].sort((a, b) => {
            const secA = a.section ? a.section.toLowerCase() : 'math';
            const secB = b.section ? b.section.toLowerCase() : 'math';
            if (secA === 'reading' && secB === 'math') return -1;
            if (secA === 'math' && secB === 'reading') return 1;
            return 0;
        });
        
        const readingAnswersStr = localStorage.getItem(`sat_full_reading_${testId}`);
        let readingAnswers = [];
        try { readingAnswers = JSON.parse(readingAnswersStr) || []; } catch(e) {}
        
        answersToLog = [];
        let rIndex = 0;
        let mIndex = 0;
        for (let q of questionsToLog) {
            const sec = q.section ? q.section.toLowerCase() : 'math';
            if (sec === 'reading') {
                answersToLog.push(readingAnswers[rIndex++] || null);
            } else {
                answersToLog.push(state.answers[mIndex++] || null);
            }
        }
    }
    
    state.logQuestions = questionsToLog;
    state.logAnswers = answersToLog;

    for (let i = 0; i < questionsToLog.length; i++) {
      const q = questionsToLog[i];
      const userAnswer = answersToLog[i];
      const correctAnswer = q.correct_answer_index;

      let isCorrect = false;
      if (q.question_type === 'spr') {
        const userAns = (userAnswer || '').toString().trim();
        const correctAns = (q.correct_answer_text || '').toString().trim();
        isCorrect = (userAns !== '' && userAns === correctAns);
      } else {
        isCorrect = (userAnswer === correctAnswer);
      }

      if (!isCorrect) {
        errorCount++;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'error-item';

        let userAnswerText = 'No Answer Selected';
        let correctAnswerText = '';

        if (q.question_type === 'spr') {
          userAnswerText = (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') ? userAnswer : 'No Answer Selected';
          correctAnswerText = q.correct_answer_text || '';
        } else {
          let parsedOpts = q.options;
          if (typeof parsedOpts === 'string') {
            try { parsedOpts = JSON.parse(parsedOpts); } catch(e) { parsedOpts = []; }
          }
          const rawUserAns = (userAnswer !== undefined && userAnswer !== null && parsedOpts) ? parsedOpts[userAnswer] : null;
          const rawCorrectAns = (parsedOpts && correctAnswer !== undefined && correctAnswer !== null) ? parsedOpts[correctAnswer] : null;

          const resolvedUserAns = rawUserAns ? resolveImageUrl(rawUserAns) : null;
          const resolvedCorrectAns = rawCorrectAns ? resolveImageUrl(rawCorrectAns) : null;

          userAnswerText = (resolvedUserAns !== undefined && resolvedUserAns !== null)
            ? (isImageUrl(resolvedUserAns) ? `<img src="${resolvedUserAns}" style="max-height: 80px; object-fit: contain; display: block;" />` : rawUserAns)
            : 'No Answer Selected';

          correctAnswerText = (resolvedCorrectAns !== undefined && resolvedCorrectAns !== null)
            ? (isImageUrl(resolvedCorrectAns) ? `<img src="${resolvedCorrectAns}" style="max-height: 80px; object-fit: contain; display: block;" />` : rawCorrectAns)
            : '';
        }

        console.log(`[Error Log Debug] Question ${i + 1}: type=${q.question_type}, userAnswer=${userAnswer}, db_correct_text=${q.correct_answer_text}, resolvedUserText=${userAnswerText}, resolvedCorrectText=${correctAnswerText}`);

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

        const sectionName = (q.section && q.section.toLowerCase() === 'reading') ? 'Reading & Writing' : 'Math';
        itemDiv.innerHTML = `
          <div class="error-qnum">Question ${i + 1} (${sectionName} - Module ${q.module})</div>
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
    
    // Render mathjax for the newly added math questions
    if (window.MathJax) {
      MathJax.typesetPromise([dom.errorLogContent]);
    }
  }

  async function handleAIExplain(e) {
      const btn = e.currentTarget;
      const index = btn.getAttribute('data-index');
      const box = document.getElementById(`ai-explanation-${index}`);
      
      btn.disabled = true;
      btn.innerHTML = '✨ Thinking...';
      box.style.display = 'block';
      box.innerHTML = 'AI is analyzing your answer...';

      const q = state.logQuestions[index];
      const userAnswerLog = state.logAnswers[index];
      const token = localStorage.getItem('token');
      
      let parsedOpts = q.options;
      if (parsedOpts && typeof parsedOpts === 'string') {
          try { parsedOpts = JSON.parse(parsedOpts); } catch(err) { parsedOpts = []; }
      } else if (!parsedOpts) {
          parsedOpts = [];
      }
      
      let userAnswerText = 'No Answer Selected';
      let correctAnswerText = '';

      if (q.question_type === 'spr') {
          userAnswerText = (userAnswerLog !== null && userAnswerLog !== '') ? userAnswerLog : 'No Answer Selected';
          correctAnswerText = q.correct_answer_text || '';
      } else {
          userAnswerText = userAnswerLog !== null ? (parsedOpts[userAnswerLog] || 'No Answer Selected') : 'No Answer Selected';
          correctAnswerText = q.correct_answer_index !== null ? (parsedOpts[q.correct_answer_index] || '') : '';
      }

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
          if (window.MathJax) {
              MathJax.typesetPromise([box]).catch((err) => console.log('MathJax error', err));
          }
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
        window.location.href = '/login';
        return;
    }
    
    const testId = new URLSearchParams(window.location.search).get('id');
    if (!testId) {
        window.location.href = '/dashboard';
        return;
    }
    
    try {
        const response = await fetch(`/api/tests/${testId}/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            window.location.href = '/dashboard';
            return;
        }
        
        const data = await response.json();
        
        if (data.test && (data.test.allow_practice === 0 || data.test.allow_practice === false)) {
            if (dom.practiceToggle) dom.practiceToggle.style.display = 'none';
        } else {
            if (dom.practiceToggle) dom.practiceToggle.style.display = 'flex';
        }
        
        let filteredQuestions = data.questions;
        const actualTestType = new URLSearchParams(window.location.search).get('type');
        if (actualTestType === 'full') {
            filteredQuestions = data.questions.filter(q => {
                const sec = q.section ? q.section.toLowerCase() : 'math';
                return sec === 'math';
            });
        }
        
        SAT_MATH_QUESTIONS = filteredQuestions;
        state.allQuestions = data.questions;
        
        // Preload all question images into browser cache for instant rendering
        if (Array.isArray(SAT_MATH_QUESTIONS)) {
            SAT_MATH_QUESTIONS.forEach(q => {
                if (q.image_url && isImageUrl(q.image_url)) {
                    const img = new Image();
                    img.src = resolveImageUrl(q.image_url);
                }
            });
        }
        
        const numQ = SAT_MATH_QUESTIONS.length;
        state.answers = new Array(numQ).fill(null);
        state.flagged = new Array(numQ).fill(false);

        // Restore Practice Mode state
        state.questionSubmitted = new Array(numQ).fill(false);
        const savedPractice = localStorage.getItem(`sat-practice-mode-${testId}`);
        if (savedPractice === 'true') {
            state.practiceMode = true;
            if (dom.practiceToggle) {
                dom.practiceToggle.classList.add('active');
                dom.practiceToggle.disabled = true;
            }
        }
        const savedSubmitted = localStorage.getItem(`sat-practice-submitted-${testId}`);
        if (savedSubmitted) {
            try {
                const parsedSub = JSON.parse(savedSubmitted);
                if (Array.isArray(parsedSub) && parsedSub.length === numQ) {
                    state.questionSubmitted = parsedSub;
                }
            } catch(e) {}
        }
        
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
        
        const savedResume = localStorage.getItem(`sat-resume-${testId}-${state.testType}`);
        if (savedResume) {
            try {
                const s = JSON.parse(savedResume);
                if (s.currentModule) state.currentModule = s.currentModule;
                if (s.currentQuestion !== undefined) state.currentQuestion = s.currentQuestion;
            } catch(e) {}
        }
        // Fetch bookmarks
        const bkRes = await fetch(`/api/tests/${testId}/bookmarks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bkRes.ok) {
            state.bookmarked = await bkRes.json();
        }

        const userName = localStorage.getItem('userName') || 'Học sinh';
        if (dom.studentName) dom.studentName.textContent = userName;

        renderQuestion();

        const savedTimer = localStorage.getItem(`sat-timer-${testId}-${state.testType}-${state.currentModule}`);
        if (savedTimer !== null) {
            state.timerSeconds = parseInt(savedTimer, 10);
        }

        startTimer();
        initEvents();
        initKeyboardShortcuts();
    } catch (err) {
        console.error(err);
        alert('Error loading test. Please login again.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
