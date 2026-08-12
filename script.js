let display = document.getElementById('display');

function appendToDisplay(value) {
    if (display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    display.value = '0';
}

function deleteLastChar() {
    if (display.value === '0') return;
    display.value = display.value.slice(0, -1);
    if (display.value === '') {
        display.value = '0';
    }
}

function calculate() {
    try {
        let result = eval(display.value);
        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '0';
        }, 1500);
    }
}

// Initialize display
if (display.value === '') {
    display.value = '0';
}