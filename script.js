const input = document.getElementById('input');
const fileInput = document.getElementById('file');
const countInput = document.getElementById('count');
const goBtn = document.getElementById('go');
const result = document.getElementById('result');
const summaryEl = document.getElementById('summary');

// Load a .txt file into the text box
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { input.value = reader.result; };
  reader.readAsText(file);
});

// Pick the most important sentences by word frequency
function summarize(text, count) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= count) return text;

  const stop = new Set(['the','a','an','and','or','but','of','to','in','on','for','with','is','are','was','were','it','this','that','as','at','by','from']);
  const freq = {};

  (text.toLowerCase().match(/[a-z']+/g) || []).forEach(word => {
    if (!stop.has(word) && word.length > 2) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });

  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z']+/g) || [];
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / (words.length || 1);
    return { sentence: sentence.trim(), index, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)   // best first
    .slice(0, count)                     // keep top N
    .sort((a, b) => a.index - b.index)   // restore original order
    .map(item => item.sentence)
    .join(' ');
}

goBtn.addEventListener('click', () => {
  const text = input.value.trim();

  if (text.length < 40) {
    summaryEl.textContent = 'Please enter a longer text.';
    result.hidden = false;
    return;
  }

  summaryEl.textContent = summarize(text, Number(countInput.value));
  result.hidden = false;
});
