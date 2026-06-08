const DEFAULT_SPREADSHEET_ID = '1AqDlnBGotmgORDNd1HNaSfvr5xsAhaaorap6WN3RxE0';
const DEFAULT_SHEET_NAME = '題庫';
const QUESTION_COUNT = 10;
const TOTAL_SCORE = 100;

const DEMO_BANK = [
  ['advantage', '優點；優勢'],
  ['brave', '勇敢的'],
  ['calendar', '日曆；行事曆'],
  ['careful', '小心的；仔細的'],
  ['choice', '選擇'],
  ['create', '創造'],
  ['difficult', '困難的'],
  ['enough', '足夠的'],
  ['friendship', '友誼'],
  ['healthy', '健康的'],
  ['journey', '旅程'],
  ['knowledge', '知識'],
  ['leader', '領導者'],
  ['memory', '記憶'],
  ['pattern', '模式；樣式'],
  ['quality', '品質'],
  ['resource', '資源'],
  ['support', '支持；支援'],
  ['wonder', '驚奇；想知道'],
  ['yesterday', '昨天'],
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('英文單字測驗')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getQuizBootstrap() {
  const source = loadQuestionBank_();
  const quiz = buildQuiz_(source.entries, QUESTION_COUNT);
  const questionCount = quiz.length;
  const pointsPerQuestion = questionCount > 0 ? TOTAL_SCORE / questionCount : TOTAL_SCORE;

  return {
    title: '英文單字測驗',
    subtitle: '題目會從 Google 試算表讀取英文單字與中文意思，系統隨機出題，答完可立即看到成績。',
    totalScore: TOTAL_SCORE,
    questionCount: questionCount,
    pointsPerQuestion: pointsPerQuestion,
    sourceCount: source.entries.length,
    sourceLabel: source.label,
    warning: source.warning,
    quiz: quiz,
  };
}

function loadQuestionBank_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = String(props.getProperty('QUIZ_SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID).trim();
  const sheetName = String(props.getProperty('QUIZ_SHEET_NAME') || DEFAULT_SHEET_NAME).trim();

  if (!spreadsheetId) {
    return {
      label: '範例題庫',
      entries: normalizeEntries_(DEMO_BANK),
      warning: '尚未設定試算表 ID，已使用示範題庫。',
    };
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getSheets()[0];
    if (!sheet) {
      throw new Error('找不到可用的工作表');
    }

    const values = sheet.getDataRange().getDisplayValues();
    const parsed = parseSheetRows_(values);
    const entries = parsed.entries;

    if (entries.length < 4) {
      return {
        label: sheet.getName() + '（資料不足，改用示範題庫）',
        entries: normalizeEntries_(DEMO_BANK),
        warning: '試算表內題目數量不足，已改用示範題庫。',
      };
    }

    return {
      label: sheet.getName(),
      entries: entries,
      warning: '',
    };
  } catch (error) {
    return {
      label: '示範題庫',
      entries: normalizeEntries_(DEMO_BANK),
      warning: '讀取試算表失敗，已使用示範題庫：' + error.message,
    };
  }
}

function parseSheetRows_(values) {
  if (!values || values.length === 0) {
    return { entries: [] };
  }

  const headerRowIndex = findHeaderRowIndex_(values);
  const headerMap = headerRowIndex >= 0 ? buildHeaderMap_(values[headerRowIndex]) : null;
  const startRowIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
  const rows = values.slice(startRowIndex);

  if (headerMap) {
    return {
      entries: rows
        .map(function (row) {
          return {
            word: pickColumnValue_(row, headerMap.wordIndex, headerMap.wordFallbackIndex),
            meaning: pickColumnValue_(row, headerMap.meaningIndex, headerMap.meaningFallbackIndex),
          };
        })
        .filter(function (row) { return row.word && row.meaning; }),
    };
  }

  return rows
    .map(function (row) {
      return {
        word: String(row[0] || '').trim(),
        meaning: String(row[1] || '').trim(),
      };
    })
    .filter(function (row) { return row.word && row.meaning; })
    .map(function (row) { return row; });
}

function findHeaderRowIndex_(values) {
  for (let index = 0; index < Math.min(values.length, 5); index += 1) {
    if (looksLikeHeader_(values[index])) {
      return index;
    }
  }
  return -1;
}

function buildHeaderMap_(row) {
  const cells = row.map(function (cell) { return normalizeCell_(cell); });
  const lowerCells = cells.map(function (cell) { return cell.toLowerCase(); });

  const wordIndex = findColumnIndex_(lowerCells, /^(英文|單字|word|vocab|term|question|題目)$/);
  const meaningIndex = findColumnIndex_(lowerCells, /^(中文|意思|中文意思|meaning|answer|translation|解釋|翻譯|答案)$/);

  const fallbackWordIndex = cells.length > 0 ? 0 : -1;
  const fallbackMeaningIndex = cells.length > 1 ? 1 : -1;

  if (wordIndex === -1 && meaningIndex === -1) {
    return null;
  }

  return {
    wordIndex: wordIndex >= 0 ? wordIndex : fallbackWordIndex,
    meaningIndex: meaningIndex >= 0 ? meaningIndex : fallbackMeaningIndex,
    wordFallbackIndex: fallbackWordIndex,
    meaningFallbackIndex: fallbackMeaningIndex,
  };
}

function findColumnIndex_(cells, pattern) {
  for (let index = 0; index < cells.length; index += 1) {
    if (pattern.test(cells[index])) {
      return index;
    }
  }
  return -1;
}

function pickColumnValue_(row, primaryIndex, fallbackIndex) {
  const primary = primaryIndex >= 0 ? String(row[primaryIndex] || '').trim() : '';
  if (primary) {
    return primary;
  }

  const fallback = fallbackIndex >= 0 ? String(row[fallbackIndex] || '').trim() : '';
  return fallback;
}

function looksLikeHeader_(row) {
  const text = row.map(function (cell) { return String(cell || '').trim(); }).join(' ').toLowerCase();
  return /單字|英文|中文|word|meaning|answer|題目|答案|translation|vocab|term/.test(text);
}

function normalizeEntries_(rows) {
  return rows
    .map(function (row) { return { word: String(row[0] || '').trim(), meaning: String(row[1] || '').trim() }; })
    .filter(function (row) { return row.word && row.meaning; });
}

function buildQuiz_(entries, count) {
  const uniqueEntries = dedupeEntries_(entries);
  const questionPool = shuffle_(uniqueEntries.slice()).slice(0, Math.min(count, uniqueEntries.length));
  const allMeanings = uniqueValues_(uniqueEntries.map(function (entry) { return entry.meaning; }));

  return questionPool.map(function (entry, index) {
    const wrongMeanings = allMeanings.filter(function (meaning) { return meaning !== entry.meaning; });
    const options = shuffle_([entry.meaning].concat(pickRandom_(wrongMeanings, 3)));
    while (options.length < 4 && wrongMeanings.length > 0) {
      options.push(wrongMeanings[options.length % wrongMeanings.length]);
    }

    return {
      id: index + 1,
      word: entry.word,
      meaning: entry.meaning,
      options: options.slice(0, 4),
      answerIndex: options.slice(0, 4).indexOf(entry.meaning),
    };
  });
}

function dedupeEntries_(entries) {
  const seen = new Set();
  const unique = [];

  entries.forEach(function (entry) {
    const key = entry.word + '__' + entry.meaning;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ word: entry.word, meaning: entry.meaning });
    }
  });

  return unique;
}

function uniqueValues_(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function pickRandom_(array, count) {
  const pool = array.slice();
  const result = [];
  while (pool.length > 0 && result.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function shuffle_(array) {
  const result = array.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = temp;
  }
  return result;
}