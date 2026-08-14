(function () {
  'use strict';

  let SAT_QUESTIONS = [];
  
  const state = {
    currentQuestion: 0,
    testId: new URLSearchParams(window.location.search).get('id'),
    answers: [],
    flagged: [],
    questionSubmitted: [], // Track immediate feedback submissions
    bookmarked: [],
    testType: 'topic',
    testTitle: 'Chuyên đề Luyện tập',
    reviewMode: false
  };

  // ---- DOM References ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    currentTimeDisplay: $('#currentTimeDisplay'),
    btnHideTimer: $('#btnHideTimer'),
    timerContainer: $('#timerContainer'),
    btnExitTest: $('#btnExitTest'),
    directionsBanner: $('#directionsBanner'),
    directionsClose: $('#directionsClose'),
    passageContainer: $('#passageContainer'),
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
    btnMore: $('#btnMore'),
    moreDropdown: $('#moreDropdown'),
    btnAnnotate: $('#btnAnnotate'),
    btnHelp: $('#btnHelp'),
    btnCalculator: $('#btnCalculator'),
    calcOverlay: $('#calcOverlay'),
    calcClose: $('#calcClose'),
    btnReference: $('#btnReference'),
    refOverlay: $('#refOverlay'),
    refClose: $('#refClose'),
    toast: $('#toast'),
    toastMessage: $('#toastMessage'),
    scoreOverlay: $('#scoreOverlay'),
    scoreCorrect: $('#scoreCorrect'),
    scoreTotal: $('#scoreTotal'),
    btnScoreHome: $('#btnScoreHome'),
    btnScoreReview: $('#btnScoreReview'),
    errorLogOverlay: $('#errorLogOverlay'),
    btnCloseErrorLog: $('#btnCloseErrorLog'),
    btnExportPDF: $('#btnExportPDF'),
    errorLogContent: $('#error-log-content'),
    practiceTopicTitle: $('#practiceTopicTitle')
  };

  // ---- Image Resolvers ----
  function isImageUrl(url) {
      if (!url) return false;
      return url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) !== null || url.startsWith('data:image/') || url.includes('/api/images/');
  }

  function resolveImageUrl(url) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
          return url;
      }
      return url.startsWith('/') ? url : '/' + url;
  }

  function convertMarkdownTablesToHtml(text) {
      if (!text || typeof text !== 'string' || !text.includes('|')) return text;
      
      // Standard markdown table regex
      const tableRegex = /(?:\|[^\n]+\|\r?\n)+(?:\|[-:\s|]+\|\r?\n)(?:\|[^\n]+\|\r?\n?)+/g;
      
      return text.replace(tableRegex, (match) => {
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

  // ---- Clock Timer (Live GMT+7 with seconds) ----
  let clockInterval = null;
  let timerHidden = false;

  function startClock() {
      if (clockInterval) clearInterval(clockInterval);
      
      function update() {
          const now = new Date();
          const options = { 
              timeZone: 'Asia/Ho_Chi_Minh', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit', 
              hour12: true 
          };
          dom.currentTimeDisplay.textContent = now.toLocaleTimeString('en-US', options);
      }
      
      update();
      clockInterval = setInterval(update, 1000);
  }

  function toggleTimer() {
      timerHidden = !timerHidden;
      dom.timerContainer.classList.toggle('timer-hidden', timerHidden);
      dom.btnHideTimer.textContent = timerHidden ? 'Show' : 'Hide';
  }

  // ---- Layout Auto-adaptation ----
  function adjustLayout() {
      const q = SAT_QUESTIONS[state.currentQuestion];
      const panelLeft = $('#panelLeft');
      const panelDivider = $('#panelDivider');
      const panelRight = $('#panelRight');
      
      if (q && q.passage && q.passage.trim() !== '') {
          panelLeft.style.display = 'block';
          panelDivider.style.display = 'block';
          panelRight.style.width = ''; 
          panelLeft.style.width = '50%';
      } else {
          panelLeft.style.display = 'none';
          panelDivider.style.display = 'none';
          panelRight.style.width = '100%';
      }
  }

  // ---- Render Question ----
  function renderQuestion() {
      if (SAT_QUESTIONS.length === 0) return;
      
      adjustLayout();
      const q = SAT_QUESTIONS[state.currentQuestion];
      const hasPassage = q.passage && q.passage.trim() !== '';

      // Set header title
      const relativeIdx = state.currentQuestion;
      const totalQ = SAT_QUESTIONS.length;
      dom.questionNavLabel.textContent = `Question ${relativeIdx + 1} of ${totalQ}`;

      // 1. Render Passage (left pane)
      if (hasPassage) {
          dom.passageContainer.innerHTML = `<div class="passage-text">${convertMarkdownTablesToHtml(q.passage)}</div>`;
      } else {
          dom.passageContainer.innerHTML = '';
      }

      // 2. Render Question Card (right pane)
      let imageHtml = '';
      if (q.image_url && isImageUrl(q.image_url)) {
          imageHtml = `<img src="${resolveImageUrl(q.image_url)}" class="question-image" alt="Question Graphic" style="max-height: 380px; object-fit: contain; margin-bottom:15px; display:block;" />`;
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

      // Render flagged/bookmark icon state
      const isFlaggedClass = state.flagged[state.currentQuestion] ? 'flagged' : '';
      const flagSvg = `
          <button class="flag-btn ${isFlaggedClass}" id="btnFlag" title="Flag for review">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <span>Flag</span>
          </button>
      `;

      let parsedOpts = q.options;
      if (typeof parsedOpts === 'string') {
          try { parsedOpts = JSON.parse(parsedOpts); } catch(err) { parsedOpts = []; }
      }

      const letters = ['A', 'B', 'C', 'D'];
      let optionsHtml = '';
      const isSubmitted = state.questionSubmitted[state.currentQuestion];

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

      if (q.question_type === 'mcq' || (parsedOpts && parsedOpts.length > 0)) {
          optionsHtml = '<div class="answer-options-container" id="answerOptions">';
          parsedOpts.forEach((opt, i) => {
              let reviewClass = '';
              if (isSubmitted) {
                  if (i === q.correct_answer_index) reviewClass = 'review-correct';
                  else if (state.answers[state.currentQuestion] === i && i !== q.correct_answer_index) reviewClass = 'review-wrong';
              }
              const selected = state.answers[state.currentQuestion] === i ? 'selected' : '';
              const resolvedOpt = resolveImageUrl(opt);
              const optionContent = isImageUrl(resolvedOpt)
                ? `<img src="${resolvedOpt}" class="option-image" style="max-height: 100px; object-fit: contain; display: block;" />`
                : convertMarkdownTablesToHtml(opt);

              optionsHtml += `
                <div class="answer-option ${selected} ${reviewClass}" data-index="${i}" id="answer-option-${i}">
                  <span class="answer-letter">${letters[i]}</span>
                  <span class="answer-text">${optionContent}</span>
                  ${!isSubmitted ? `<button class="strikethrough-btn" title="Cross out" data-index="${i}">S&#x0336;</button>` : ''}
                </div>`;
          });
          optionsHtml += '</div>';
      } else {
          // SPR response
          const sprValue = state.answers[state.currentQuestion] !== undefined && state.answers[state.currentQuestion] !== null ? state.answers[state.currentQuestion] : '';
          let feedbackHtml = '';
          if (isSubmitted) {
              const isCorrect = sprValue.toString().trim().toLowerCase() === (q.correct_answer_text || '').toLowerCase();
              feedbackHtml = `
                <div style="margin-top: 15px; font-weight: 600; font-size:15px; color: ${isCorrect ? '#22c55e' : '#ef4444'}">
                    ${isCorrect ? '✅ Đúng!' : '❌ Chưa chính xác.'}<br>
                    <span>Đáp án của bạn: <strong>${sprValue}</strong></span><br>
                    <span>Đáp án đúng: <strong>${q.correct_answer_text}</strong></span>
                </div>
              `;
          }

          optionsHtml = `
              <div class="spr-input-container">
                  <input type="text" id="sprAnswerInput" class="spr-input" placeholder="" maxlength="6" value="${sprValue}" ${isSubmitted ? 'disabled' : ''}>
                  <div class="spr-preview">Answer Preview: <span id="sprAnswerPreview">${sprValue}</span></div>
              </div>
              ${feedbackHtml}
          `;
      }

      // Submit Button and AI explain
      let actionBtnHtml = '';
      if (!isSubmitted) {
          actionBtnHtml = `<button class="btn-submit-answer" id="btnSubmitAnswer" style="margin-top:20px; padding:12px 24px; font-weight:600; background:var(--gradient-primary); color:white; border:none; border-radius:8px; cursor:pointer;">Nộp câu trả lời</button>`;
      } else {
          actionBtnHtml = `
              <div style="margin-top:20px; display:flex; gap:12px; align-items:center;">
                  <button class="btn-explain-ai" id="btnExplainAI" style="padding:10px 20px; font-weight:600; background:#8b5cf6; color:white; border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:6px;">✨ Giải thích bằng AI</button>
                  <span style="color:#22c55e; font-weight:500; font-size:13px;">✓ Đã lưu câu trả lời</span>
              </div>
              <div id="aiExplanationBox" style="display:none; margin-top:15px; padding:15px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); line-height:1.6; font-size:14px; max-height: 400px; overflow-y: auto;"></div>
          `;
      }

      const panelRightEl = $('#panelRight');
      if (q.question_type === 'spr') {
          dom.questionContainer.classList.add('spr-mode');
          if (panelRightEl) panelRightEl.classList.add('spr-active');
          
          dom.questionContainer.innerHTML = `
              <div class="spr-layout">
                  <div class="spr-left">
                      ${directionsHtml}
                  </div>
                  <div class="spr-right">
                      <div class="question-header">
                          <span class="question-number">Question ${relativeIdx + 1}</span>
                          ${flagSvg}
                      </div>
                      ${imageHtml}
                      <div class="question-prompt" style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${promptHtml}</div>
                      ${optionsHtml}
                      ${actionBtnHtml}
                  </div>
              </div>
          `;
      } else {
          dom.questionContainer.classList.remove('spr-mode');
          if (panelRightEl) panelRightEl.classList.remove('spr-active');
          
          dom.questionContainer.innerHTML = `
              <div class="question-header">
                  <span class="question-number">Question ${relativeIdx + 1}</span>
                  ${flagSvg}
              </div>
              ${imageHtml}
              <div class="question-prompt" style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${promptHtml}</div>
              ${optionsHtml}
              ${actionBtnHtml}
          `;
      }

      // Bind events inside question container
      $('#btnFlag').addEventListener('click', toggleFlag);
      
      if (!isSubmitted && !state.reviewMode) {
          $('#btnSubmitAnswer').addEventListener('click', submitAnswer);
          
          if (q.question_type === 'mcq' || (parsedOpts && parsedOpts.length > 0)) {
              // Click options
              const answerOptions = $('#answerOptions');
              answerOptions.addEventListener('click', (e) => {
                  if (state.reviewMode) return;
                  const option = e.target.closest('.answer-option');
                  const strikeBtn = e.target.closest('.strikethrough-btn');
                  
                  if (strikeBtn) {
                      e.stopPropagation();
                      const strikeIdx = parseInt(strikeBtn.dataset.index);
                      const optEl = document.getElementById(`answer-option-${strikeIdx}`);
                      if (optEl) optEl.classList.toggle('strikethrough');
                      return;
                  }

                  if (!option) return;
                  const selectedIdx = parseInt(option.dataset.index);
                  state.answers[state.currentQuestion] = selectedIdx;
                  
                  // Update active UI style
                  $$('.answer-option').forEach(el => el.classList.remove('selected'));
                  option.classList.add('selected');
              });
          } else {
              // Input text SPR
              const sprInput = $('#sprAnswerInput');
              if (sprInput) {
                  sprInput.addEventListener('input', (e) => {
                      state.answers[state.currentQuestion] = e.target.value;
                      const preview = $('#sprAnswerPreview');
                      if (preview) preview.textContent = e.target.value;
                  });
              }
          }
      } else {
          // Bind AI Explain
          $('#btnExplainAI').addEventListener('click', handleAIExplain);
      }

      // Typeset MathJax
      if (window.MathJax) {
          MathJax.typesetPromise([dom.passageContainer, dom.questionContainer]).catch((err) => console.log('MathJax error', err));
      }
      
      // Update buttons state
      dom.btnBack.disabled = state.currentQuestion === 0;
      dom.btnNext.textContent = state.currentQuestion === SAT_QUESTIONS.length - 1 ? 'Finish' : 'Next';
  }

  // ---- Flag Toggle ----
  function toggleFlag() {
      const active = !state.flagged[state.currentQuestion];
      state.flagged[state.currentQuestion] = active;
      const btn = $('#btnFlag');
      if (active) {
          btn.classList.add('flagged');
          showToast('Question flagged for review');
      } else {
          btn.classList.remove('flagged');
      }
  }

  // ---- Submit Single Answer ----
  async function submitAnswer() {
      const q = SAT_QUESTIONS[state.currentQuestion];
      const ans = state.answers[state.currentQuestion];
      
      if (ans === undefined || ans === null || ans.toString().trim() === '') {
          alert('Vui lòng chọn hoặc nhập đáp án trước khi nộp.');
          return;
      }

      state.questionSubmitted[state.currentQuestion] = true;
      renderQuestion();
      saveProgress(false); // Save progress
  }

  // ---- Explain with AI ----
  async function handleAIExplain() {
      const btn = $('#btnExplainAI');
      const box = $('#aiExplanationBox');
      
      btn.disabled = true;
      btn.textContent = '✨ AI đang phân tích...';
      box.style.display = 'block';
      box.innerHTML = 'AI đang giải nghĩa câu hỏi và phân tích đáp án của bạn. Vui lòng đợi trong giây lát...';

      const q = SAT_QUESTIONS[state.currentQuestion];
      const token = localStorage.getItem('token');

      let parsedOpts = q.options;
      if (typeof parsedOpts === 'string') {
          try { parsedOpts = JSON.parse(parsedOpts); } catch(err) { parsedOpts = []; }
      }

      let userAnswerText = '';
      if (q.question_type === 'mcq' || (parsedOpts && parsedOpts.length > 0)) {
          userAnswerText = state.answers[state.currentQuestion] !== null ? parsedOpts[state.answers[state.currentQuestion]] : 'Không có câu trả lời';
      } else {
          userAnswerText = state.answers[state.currentQuestion] || 'Không có câu trả lời';
      }
      
      const correctAnswerText = q.question_type === 'mcq' ? parsedOpts[q.correct_answer_index] : q.correct_answer_text;

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
          if (window.MathJax) { window.MathJax.typesetPromise([box]); }
          btn.textContent = '✨ Giải thích lại';
          btn.disabled = false;
      } catch (err) {
          console.error(err);
          box.innerHTML = '<span style="color:#ef4444;">Đã có lỗi xảy ra khi gọi AI giải thích. Vui lòng thử lại sau.</span>';
          btn.textContent = '✨ Giải thích bằng AI';
          btn.disabled = false;
      }
  }

  // ---- Save Student Progress ----
  async function saveProgress(completed = false) {
      const token = localStorage.getItem('token');
      if (!token || !state.testId) return;

      // Calculate score (correct answers)
      let correct = 0;
      for (let i = 0; i < SAT_QUESTIONS.length; i++) {
          const q = SAT_QUESTIONS[i];
          const ans = state.answers[i];
          if (state.questionSubmitted[i]) {
              if (q.question_type === 'mcq') {
                  if (ans === q.correct_answer_index) correct++;
              } else {
                  if (ans && ans.toString().trim().toLowerCase() === (q.correct_answer_text || '').toLowerCase()) correct++;
              }
          }
      }

      // Save local resume info
      localStorage.setItem(`sat-resume-${state.testId}-${state.testType}`, JSON.stringify({
          currentQuestion: state.currentQuestion,
          questionSubmitted: state.questionSubmitted
      }));

      try {
          await fetch('/api/save-progress', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                  test_id: state.testId,
                  answers: state.answers,
                  score: correct,
                  completed: completed
              })
          });
      } catch(err) {
          console.error('Failed to save progress', err);
      }
  }

  // ---- Next / Back Events ----
  function nextQuestion() {
      if (state.currentQuestion < SAT_QUESTIONS.length - 1) {
          state.currentQuestion++;
          renderQuestion();
          saveProgress(false);
      } else {
          // Complete practice
          finishPractice();
      }
  }

  function prevQuestion() {
      if (state.currentQuestion > 0) {
          state.currentQuestion--;
          renderQuestion();
          saveProgress(false);
      }
  }

  function goToQuestion(idx) {
      if (idx >= 0 && idx < SAT_QUESTIONS.length) {
          state.currentQuestion = idx;
          renderQuestion();
          saveProgress(false);
      }
  }

  // ---- Finish Practice ----
  async function finishPractice() {
      let correct = 0;
      let answeredCount = 0;
      
      // Count how many questions are actually answered
      for (let i = 0; i < SAT_QUESTIONS.length; i++) {
          const ans = state.answers[i];
          if (ans !== null && ans !== undefined && ans.toString().trim() !== '') {
              answeredCount++;
          }
      }

      // Warn if not all questions answered
      if (answeredCount < SAT_QUESTIONS.length) {
          if (!confirm(`Bạn mới trả lời ${answeredCount}/${SAT_QUESTIONS.length} câu. Hoàn thành luyện tập bây giờ?`)) {
              return;
          }
      }

      // Mark all questions as submitted and grade them
      for (let i = 0; i < SAT_QUESTIONS.length; i++) {
          state.questionSubmitted[i] = true;
          const q = SAT_QUESTIONS[i];
          const ans = state.answers[i];
          
          if (q.question_type === 'mcq') {
              if (ans === q.correct_answer_index) correct++;
          } else {
              if (ans && ans.toString().trim().toLowerCase() === (q.correct_answer_text || '').toLowerCase()) correct++;
          }
      }

      dom.scoreCorrect.textContent = correct;
      dom.scoreTotal.textContent = SAT_QUESTIONS.length;
      
      const pct = SAT_QUESTIONS.length > 0 ? Math.round((correct / SAT_QUESTIONS.length) * 100) : 0;
      const scorePercentEl = $('#scorePercent');
      if (scorePercentEl) scorePercentEl.textContent = `${pct}% Correct`;

      const circleBar = $('#scoreCircleBar');
      if (circleBar) {
          const circumference = 439.8;
          const offset = circumference * (1 - (correct / SAT_QUESTIONS.length));
          circleBar.style.strokeDashoffset = circumference;
          setTimeout(() => {
              circleBar.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
              circleBar.style.strokeDashoffset = offset;
          }, 100);
      }

      dom.scoreOverlay.classList.add('active');
      await saveProgress(true); // Complete
      
      // Clear local storage resume
      localStorage.removeItem(`sat-resume-${state.testId}-${state.testType}`);
  }

  // ---- Navigation Grid Modal ----
  function renderQuestionGrid() {
      dom.questionGrid.innerHTML = '';
      for (let i = 0; i < SAT_QUESTIONS.length; i++) {
          const btn = document.createElement('button');
          btn.className = 'question-grid-btn';
          btn.textContent = i + 1;

          if (i === state.currentQuestion) btn.classList.add('current');
          if (state.answers[i] !== null && state.answers[i] !== undefined && state.answers[i].toString().trim() !== '') btn.classList.add('answered');
          if (state.flagged[i]) btn.classList.add('flagged');

          btn.addEventListener('click', () => {
              goToQuestion(i);
              dom.questionNavOverlay.classList.remove('active');
          });
          dom.questionGrid.appendChild(btn);
      }
  }

  // ---- Error Log Generator ----
  function generateErrorLog() {
      dom.errorLogContent.innerHTML = '';
      let errorCount = 0;

      for (let i = 0; i < SAT_QUESTIONS.length; i++) {
          const q = SAT_QUESTIONS[i];
          const userAnswer = state.answers[i];
          const isCorrect = q.question_type === 'mcq' 
              ? userAnswer === q.correct_answer_index
              : userAnswer && userAnswer.toString().trim().toLowerCase() === (q.correct_answer_text || '').toLowerCase();

          if (!isCorrect && state.questionSubmitted[i]) {
              errorCount++;
              const itemDiv = document.createElement('div');
              itemDiv.className = 'error-item';

              let parsedOpts = q.options;
              if (typeof parsedOpts === 'string') {
                  try { parsedOpts = JSON.parse(parsedOpts); } catch(e) { parsedOpts = []; }
              }

              let userAnswerText = '';
              let correctAnswerText = '';

              if (q.question_type === 'mcq' && parsedOpts) {
                  userAnswerText = (userAnswer !== undefined && userAnswer !== null) ? parsedOpts[userAnswer] : 'Chưa trả lời';
                  correctAnswerText = parsedOpts[q.correct_answer_index];
              } else {
                  userAnswerText = userAnswer || 'Chưa trả lời';
                  correctAnswerText = q.correct_answer_text;
              }

              const userImg = isImageUrl(userAnswerText) ? `<img src="${resolveImageUrl(userAnswerText)}" style="max-height:80px;" />` : userAnswerText;
              const correctImg = isImageUrl(correctAnswerText) ? `<img src="${resolveImageUrl(correctAnswerText)}" style="max-height:80px;" />` : correctAnswerText;

              let imageHtml = '';
              if (q.image_url && isImageUrl(q.image_url)) {
                  imageHtml = `<img src="${resolveImageUrl(q.image_url)}" class="question-image" style="max-height: 200px; display:block; margin-bottom:12px;" />`;
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

              itemDiv.innerHTML = `
                  <div class="error-qnum">Question ${i + 1}</div>
                  ${q.passage ? `<div class="error-passage">${q.passage}</div>` : ''}
                  ${imageHtml}
                  <div class="error-prompt" style="white-space: pre-wrap;">${promptHtml}</div>
                  <div class="error-answers">
                      <div class="error-ans-row wrong">
                          <span class="error-ans-icon">✗</span> 
                          <span><strong>Your Answer:</strong> ${userImg}</span>
                      </div>
                      <div class="error-ans-row correct">
                          <span class="error-ans-icon">✓</span> 
                          <span><strong>Correct Answer:</strong> ${correctImg}</span>
                      </div>
                  </div>
                  <button class="btn-explain-ai" data-index="${i}" style="margin-top:12px; padding:8px 16px; background:#8b5cf6; color:white; border:none; border-radius:6px; cursor:pointer;">✨ Explain with AI</button>
                  <div id="ai-explanation-${i}" style="display:none; margin-top:10px; padding:12px; border-radius:6px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); line-height:1.6; font-size:13px;"></div>
              `;
              
              const explainBtn = itemDiv.querySelector('.btn-explain-ai');
              explainBtn.addEventListener('click', async (e) => {
                  const btn = e.currentTarget;
                  const index = btn.getAttribute('data-index');
                  const box = document.getElementById(`ai-explanation-${index}`);
                  
                  btn.disabled = true;
                  btn.textContent = '✨ Thinking...';
                  box.style.display = 'block';
                  box.innerHTML = 'AI is generating explanation...';

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
                      if (window.MathJax) { window.MathJax.typesetPromise([box]); }
                      btn.textContent = '✨ Explain Again';
                      btn.disabled = false;
                  } catch (err) {
                      console.error(err);
                      box.innerHTML = 'Failed to load explanation.';
                      btn.textContent = '✨ Explain with AI';
                      btn.disabled = false;
                  }
              });

              dom.errorLogContent.appendChild(itemDiv);
          }
      }

      if (errorCount === 0) {
          dom.errorLogContent.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary);font-size:16px;">👑 Perfect Score! No errors to show.</div>';
      }

      dom.errorLogOverlay.style.display = 'flex';
      if (window.MathJax) { window.MathJax.typesetPromise([dom.errorLogContent]); }
  }

  // ---- Toast Message ----
  function showToast(msg) {
      dom.toastMessage.textContent = msg;
      dom.toast.classList.add('active');
      setTimeout(() => dom.toast.classList.remove('active'), 2500);
  }

  // ---- Theme Toggle ----
  function initTheme() {
      const saved = localStorage.getItem('sat-theme');
      if (saved !== 'light') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
      
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
  }

  // ---- Events Init ----
  function initEvents() {
      dom.btnBack.addEventListener('click', prevQuestion);
      dom.btnNext.addEventListener('click', nextQuestion);
      
      // More Dropdown
      dom.btnMore.addEventListener('click', (e) => {
          e.stopPropagation();
          dom.moreDropdown.classList.toggle('active');
      });
      document.addEventListener('click', () => dom.moreDropdown.classList.remove('active'));

      dom.btnExitTest.addEventListener('click', () => {
          if (confirm('Bạn có muốn thoát về Dashboard? Tiến trình đã được lưu lại.')) {
              window.location.href = '/dashboard';
          }
      });

      dom.btnHelp.addEventListener('click', () => {
          alert('Chế độ luyện tập chuyên đề: Chọn hoặc nhập đáp án cho câu hỏi rồi bấm "Nộp câu trả lời" để xem kết quả đúng sai ngay lập tức. Tiến độ luyện tập được lưu tự động.');
      });

      dom.directionsClose.addEventListener('click', () => {
          dom.directionsBanner.style.display = 'none';
      });

      // Question Navigator Modal
      dom.btnQuestionNav.addEventListener('click', () => {
          renderQuestionGrid();
          dom.questionNavOverlay.classList.add('active');
      });
      dom.navModalClose.addEventListener('click', () => dom.questionNavOverlay.classList.remove('active'));
      dom.btnGoTo.addEventListener('click', () => {
          const selected = dom.questionGrid.querySelector('.question-grid-btn.current');
          if (selected) {
              const idx = parseInt(selected.textContent) - 1;
              goToQuestion(idx);
          }
          dom.questionNavOverlay.classList.remove('active');
      });

      // Calculator Overlay
      dom.btnCalculator.addEventListener('click', () => {
          dom.calcOverlay.classList.add('active');
      });
      dom.calcClose.addEventListener('click', () => {
          dom.calcOverlay.classList.remove('active');
      });

      // Reference Sheet Modal
      dom.btnReference.addEventListener('click', () => {
          dom.refOverlay.classList.add('active');
      });
      dom.refClose.addEventListener('click', () => {
          dom.refOverlay.classList.remove('active');
      });

      // Hide Timer Button
      if (dom.btnHideTimer) {
          dom.btnHideTimer.addEventListener('click', toggleTimer);
      }

      // Drag handles for modals
      initDragModal(dom.calcOverlay, $('#calcHeader'));
      initDragModal(dom.refOverlay, $('#refHeader'));

      // Score Overlay Buttons
      dom.btnScoreHome.addEventListener('click', () => {
          window.location.href = '/dashboard';
      });
      dom.btnScoreReview.addEventListener('click', () => {
          dom.scoreOverlay.classList.remove('active');
          generateErrorLog();
      });

      // Error Log Overlay Buttons
      dom.btnCloseErrorLog.addEventListener('click', () => {
          dom.errorLogOverlay.style.display = 'none';
          dom.scoreOverlay.classList.add('active');
      });

      dom.btnExportPDF.addEventListener('click', () => {
          window.print();
      });
  }

  // ---- Modal Drag Logic ----
  function initDragModal(overlay, header) {
      let isDragging = false;
      let startX, startY;
      let modal = overlay.querySelector('.modal-window');
      
      header.addEventListener('mousedown', (e) => {
          if (e.target.closest('.modal-close')) return;
          isDragging = true;
          startX = e.clientX - modal.offsetLeft;
          startY = e.clientY - modal.offsetTop;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
      });

      function onMouseMove(e) {
          if (!isDragging) return;
          modal.style.left = (e.clientX - startX) + 'px';
          modal.style.top = (e.clientY - startY) + 'px';
          modal.style.transform = 'none'; // Clear translate center
      }

      function onMouseUp() {
          isDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      }
  }

  // ---- Initialize ----
  async function init() {
      const token = localStorage.getItem('token');
      if (!token) {
          window.location.href = '/login';
          return;
      }
      if (!state.testId) {
          window.location.href = '/dashboard';
          return;
      }

      // Check for review mode parameter
      const urlParams = new URLSearchParams(window.location.search);
      state.reviewMode = urlParams.get('mode') === 'review' || urlParams.get('review') === 'true';

      try {
          const response = await fetch(`/api/tests/${state.testId}/questions`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
              window.location.href = '/dashboard';
              return;
          }

          const data = await response.json();
          SAT_QUESTIONS = data.questions || [];
          
          if (data.test) {
              state.testTitle = data.test.title;
              if (state.reviewMode) {
                  dom.practiceTopicTitle.textContent = `Xem lại chuyên đề: ${data.test.title}`;
              } else {
                  dom.practiceTopicTitle.textContent = `Chuyên đề: ${data.test.title}`;
              }
              
              // If it's a Math topic (or title contains 'math' or test type is math or questions are math), show Calculator and Reference sheet
              const isMath = data.test.type === 'math' || 
                             data.test.title.toLowerCase().includes('math') || 
                             data.test.title.toLowerCase().includes('algebra') ||
                             data.test.title.toLowerCase().includes('geometry') ||
                             (SAT_QUESTIONS.length > 0 && SAT_QUESTIONS[0].section === 'math');
              if (isMath) {
                  dom.btnCalculator.style.display = 'inline-flex';
                  dom.btnReference.style.display = 'inline-flex';
              } else {
                  dom.btnCalculator.style.display = 'none';
                  dom.btnReference.style.display = 'none';
              }
          }

          const numQ = SAT_QUESTIONS.length;
          state.answers = new Array(numQ).fill(null);
          state.flagged = new Array(numQ).fill(false);
          state.questionSubmitted = new Array(numQ).fill(false);

          // Load previous progress
          const progRes = await fetch(`/api/progress/${state.testId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (progRes.ok) {
              const progData = await progRes.json();
              if (progData && progData.answers && (progData.completed !== 1 || state.reviewMode)) {
                  const savedAnswers = JSON.parse(progData.answers);
                  for (let i = 0; i < savedAnswers.length && i < numQ; i++) {
                      state.answers[i] = savedAnswers[i];
                  }
                  
                  if (state.reviewMode) {
                      state.questionSubmitted.fill(true);
                  }
              }
          }

          // Restore active question from local storage
          const savedResume = localStorage.getItem(`sat-resume-${state.testId}-${state.testType}`);
          if (savedResume && !state.reviewMode) {
              try {
                  const s = JSON.parse(savedResume);
                  if (s.currentQuestion !== undefined) state.currentQuestion = s.currentQuestion;
                  if (s.questionSubmitted) state.questionSubmitted = s.questionSubmitted;
              } catch(e) {}
          }

          const userName = localStorage.getItem('userName') || 'Học sinh';
          if (dom.studentName) dom.studentName.textContent = userName;

          startClock();
          initTheme();
          initEvents();
          renderQuestion();

          if (state.reviewMode) {
              setTimeout(() => {
                  generateErrorLog();
              }, 500);
          }
      } catch (err) {
          console.error(err);
          alert('Error loading topic practice. Please try again.');
      }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
  } else {
      init();
  }
})();
