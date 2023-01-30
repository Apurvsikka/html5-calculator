const NUM_REGEX = /\d|\./;

const TOKEN_TYPES = Object.freeze(
  ["ParenClose", "ParenOpen", "Number", "Add", "Minus", "Multiply", "Divide"]
    .map((val, idx) => ({ [val]: idx }))
    .reduce((acc, curr) => Object.assign(acc, curr), {})
);

const OpPrecedence = {
  [TOKEN_TYPES.Add]: 1,
  [TOKEN_TYPES.Minus]: 1,
  [TOKEN_TYPES.Multiply]: 2,
  [TOKEN_TYPES.Divide]: 2
};

class Token {
  constructor(tokenType, value) {
    this.tokenType = tokenType;
    this.value = value;
  }
}

function parse(expr) {
  // This is the worst preprocessing ever and probably breaks things but who cares
  expr = expr.replace(/\s/g, "").replace(/(?<!^|-|\+|\/|\*)\(/g, "*(");

  let char, token, popped;
  let offset = 0;
  let currNum = "";

  const stack = [];
  const out = [];

  while (offset < expr.length) {
    char = expr[offset++];

    while (NUM_REGEX.test(char)) {
      currNum += char;
      char = expr[offset++];
    }

    if (currNum) {
      out.push(new Token(TOKEN_TYPES.Number, Number(currNum)));
      currNum = "";
      offset -= 1;
      continue;
    }

    switch (char) {
      case "+":
        token = new Token(TOKEN_TYPES.Add, char);
        break;

      case "-":
        token = new Token(TOKEN_TYPES.Minus, char);
        break;

      case "*":
        token = new Token(TOKEN_TYPES.Multiply, char);
        break;

      case "/":
        token = new Token(TOKEN_TYPES.Divide, char);
        break;

      case "(":
        token = new Token(TOKEN_TYPES.ParenOpen, char);
        break;

      case ")":
        try {
          while ((popped = stack.pop()).tokenType != TOKEN_TYPES.ParenOpen) {
            out.push(popped);
          }
        } catch {
          throw "Mismatched parentheses";
        }
        continue;
    }

    if (token.tokenType == TOKEN_TYPES.ParenOpen) {
      stack.push(token);
      continue;
    } else {
      while (
        stack.length &&
        OpPrecedence[stack[stack.length - 1].tokenType] >=
          OpPrecedence[token.tokenType] &&
        stack[stack.length - 1].tokenType != TOKEN_TYPES.ParenOpen
      ) {
        out.push(stack.pop());
      }
    }

    stack.push(token);
  }

  while (stack.length) {
    out.push(stack.pop());
  }

  return out;
}

function evaluate(queue) {
  const numberStack = [];

  for (let token of queue) {
    switch (token.tokenType) {
      case TOKEN_TYPES.Number:
        numberStack.push(token.value);
        break;

      case TOKEN_TYPES.Add:
        if (numberStack.length < 2)
          throw "Failed to evaluate: Not enough operands!";
        numberStack.push(numberStack.pop() + numberStack.pop());
        break;

      case TOKEN_TYPES.Minus:
        if (numberStack.length < 2)
          throw "Failed to evaluate: Not enough operands!";
        numberStack.push(-numberStack.pop() + numberStack.pop());
        break;

      case TOKEN_TYPES.Multiply:
        if (numberStack.length < 2)
          throw "Failed to evaluate: Not enough operands!";
        numberStack.push(numberStack.pop() * numberStack.pop());
        break;

      case TOKEN_TYPES.Divide:
        if (numberStack.length < 2)
          throw "Failed to evaluate: Not enough operands!";
        numberStack.push((1 / numberStack.pop()) * numberStack.pop());
        break;
    }
  }

  return numberStack[0];
}

// BEGIN CALCULATOR APP
function calculate() {
  if (calcDisplay.value) calcDisplay.value = evaluate(parse(calcDisplay.value));
}

const calcDisplay = document.getElementById("calc-display");

for (let btn of document.getElementsByClassName("calc-button")) {
  if (btn.textContent == "=") {
    btn.onclick = calculate;
  } else if (btn.textContent == "C") {
    btn.onclick = () => (calcDisplay.value = "");
  } else if (btn.textContent == "\u232B") {
    btn.onclick = () =>
      (calcDisplay.value = calcDisplay.value.slice(0, -1).trim());
  } else if (btn.textContent == "\u00f7") {
    btn.onclick = () => (calcDisplay.value = calcDisplay.value + " /");
  } else if (btn.textContent == "\u00d7") {
    btn.onclick = () => (calcDisplay.value = calcDisplay.value + " *");
  } else {
    btn.onclick = () => {
      if (
        NUM_REGEX.test(btn.textContent) &&
        NUM_REGEX.test(calcDisplay.value.slice(-1))
      )
        calcDisplay.value += btn.textContent;
      else calcDisplay.value = calcDisplay.value + " " + btn.textContent;
    };
  }
}

document.getElementsByClassName("calc")[0].style.display = "flex";
