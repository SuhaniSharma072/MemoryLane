
const words = [
  { text: 'Memory', targetId: 'memory' },
  { text: 'Lane',   targetId: 'lane'   },
];
 
words.forEach(({ text, targetId }) => {
  const container = document.getElementById(targetId);
 
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.className = 'bubbly-letter';
    span.textContent = char;
    container.appendChild(span);
  });
});
 