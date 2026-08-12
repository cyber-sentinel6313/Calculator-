// Simple calculator logic
(() => {
  const display = document.getElementById('display');
  const keys = document.querySelectorAll('.keys .btn');

  let expression = '';      // expression string used for evaluation
  let lastPressed = '';     // used to avoid duplicate operators
  let resetOnNextNumber = false; // after equals, next number should reset

  function updateDisplay(value) {
    display.textContent = value;
  }

  function appendNumber(num) {
    if (resetOnNextNumber) {
      expression = '';
      resetOnNextNumber = false;
    }
    // prevent multiple leading zeros
    if (expression === '0' && num === '0') return;
    // prevent multiple decimals in the last number
    const parts = expression.split(/[\+\-\*\/]/);
    const last = parts[parts.length - 1] || '';
    if (num === '.' && last.includes('.')) return;

    // avoid leading zero like "01"
    if (last === '0' && num !== '.' ) {
      // replace leading zero with new digit
      expression = expression.slice(0, expression.length - 1) + num;
    } else {
      expression += num;
    }
    lastPressed = 'num';
    updateDisplay(expression || '0');
  }

  function appendOperator(opSymbol) {
    if (!expression && opSymbol !== '-') return; // only allow unary minus at start
    // replace last operator if user pressed operator repeatedly
    if (lastPressed === 'op') {
      expression = expression.slice(0, -1) + opSymbol;
    } else {
      expression += opSymbol;
    }
    lastPressed = 'op';
    resetOnNextNumber = false;
    updateDisplay(expression);
  }

  function clearAll() {
    expression = '';
    lastPressed = '';
    resetOnNextNumber = false;
    updateDisplay('0');
  }

  function toggleSign() {
    // toggle sign of the last number
    const parts = expression.split(/([\+\-\*\/])/);
    // find last number token index
    let i = parts.length - 1;
    while (i >= 0 && parts[i] === '') i--;
    if (i < 0) return;
    if (/[\+\-\*\/]/.test(parts[i])) return; // last token is operator
    const num = parts[i];
    const newNum = num.startsWith('-') ? num.slice(1) : '-' + num;
    parts[i] = newNum;
    expression = parts.join('');
    updateDisplay(expression);
  }

  function percent() {
    // convert last number to percentage
    const parts = expression.split(/([\+\-\*\/])/);
    let i = parts.length - 1;
    while (i >= 0 && parts[i] === '') i--;
    if (i < 0) return;
    if (/[\+\-\*\/]/.test(parts[i])) return;
    const num = parseFloat(parts[i]);
    if (Number.isNaN(num)) return;
    parts[i] = String(num / 100);
    expression = parts.join('');
    updateDisplay(expression);
  }

  function evaluateExpression() {
    if (!expression) return;
    // prevent trailing operator
    if (/[\+\-\*\/]$/.test(expression)) {
      expression = expression.slice(0, -1);
    }
    // replace any unicode operators
    const safeExpr = expression.replace(/×/g, '*').replace(/÷/g, '/');
    try {
      // Use Function constructor to evaluate the numeric expression
      const result = Function('"use strict"; return (' + safeExpr + ')')();
      if (!isFinite(result)) {
        updateDisplay('Error');
        expression = '';
      } else {
        // round to reasonable number of decimals
        const rounded = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
        expression = String(rounded);
        updateDisplay(expression);
        resetOnNextNumber = true;
        lastPressed = 'eq';
      }
    } catch (err) {
      updateDisplay('Error');
      expression = '';
    }
  }

  keys.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');

      if (value !== null) {
        appendNumber(value);
        return;
      }
      if (!action) return;
      switch (action) {
        case 'clear':
          clearAll();
          break;
        case '=':
          evaluateExpression();
          break;
        case 'toggle-sign':
          toggleSign();
          break;
        case 'percent':
          percent();
          break;
        default:
          // action is operator like + - * /
          appendOperator(action);
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((key >= '0' && key <= '9') || key === '.') {
      appendNumber(key);
      e.preventDefault();
      return;
    }
    if (key === 'Enter' || key === '=') {
      evaluateExpression();
      e.preventDefault();
      return;
    }
    if (key === 'Backspace') {
      // remove last char
      expression = expression.slice(0, -1);
      updateDisplay(expression || '0');
      e.preventDefault();
      return;
    }
    if (key === 'Escape' || key.toLowerCase() === 'c') {
      clearAll();
      e.preventDefault();
      return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
      appendOperator(key);
      e.preventDefault();
      return;
    }
    // optional: percent by pressing '%'
    if (key === '%') {
      percent();
      e.preventDefault();
      return;
    }
  });

  // initialize
  clearAll();

})();