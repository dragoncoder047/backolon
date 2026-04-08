import "./chunk-5WRI5ZAA.js";

// node_modules/.pnpm/vanilla@https+++codeload.github.com+dragoncoder047+vanilla+tar.gz+802d55725d9defae8003ad45b19692b339a686f6/node_modules/vanilla/vanilla.js
function make(nameAndClasses, properties, ...children) {
  var el;
  if (nameAndClasses !== null) {
    const [name, ...classes] = nameAndClasses.split(".");
    el = document.createElement(name);
    if (classes.length > 0)
      el.classList.add(...classes);
    for (var [k, v] of Object.entries(properties ?? {})) {
      el.setAttribute(k, v);
    }
  } else {
    el = document.createDocumentFragment();
  }
  el.append(...children);
  return el;
}
function get(id) {
  return document.querySelector(id);
}

// website/docs.ts
var LANGUAGE_DOCS = {
  "Control Flow": {
    functions: [
      {
        name: "if",
        signature: "if condition true_expr false_expr",
        description: "Conditional branching. Evaluates condition; if truthy, evaluates true_expr, otherwise false_expr.",
        example: 'if (x > 0) "positive" "non-positive"'
      },
      // {
      //     name: "break",
      //     signature: "break",
      //     description: "Continuation variable injected into every loop scope.",
      //     example: "[x] => (if (x < 0) (break nil) (x * 2))"
      // },
      {
        name: "return",
        signature: "return",
        description: "Continuation variable for returning from a function or lambda.",
        example: '[x] => (if (x == 0) (return "zero") x)'
      }
    ]
  },
  "Operators": {
    arithmetic: [
      { op: "+", description: "Addition (also string/list concatenation)" },
      { op: "-", description: "Subtraction or unary negation" },
      { op: "*", description: "Multiplication" },
      { op: "/", description: "Division" },
      { op: "%", description: "Modulo (remainder)" },
      { op: "**", description: "Exponentiation" }
    ],
    bitwise: [
      { op: "<<", description: "Bitwise left shift" },
      { op: ">>", description: "Bitwise right shift" },
      { op: "|", description: "Bitwise OR" },
      { op: "&", description: "Bitwise AND" },
      { op: "^", description: "Bitwise XOR" }
    ],
    logical: [
      { op: "||", description: "Logical OR" },
      { op: "&&", description: "Logical AND" },
      { op: "!", description: "Logical NOT (unary)" }
    ],
    comparison: [
      { op: "==", description: "Equality" },
      { op: "!=", description: "Inequality" },
      { op: ">", description: "Greater than" },
      { op: "<", description: "Less than" },
      { op: ">=", description: "Greater than or equal" },
      { op: "<=", description: "Less than or equal" }
    ]
  },
  "Collections": {
    functions: [
      {
        name: "[ ]",
        signature: "[item1, item2, ...]",
        description: "List literal for ordered values.",
        example: "[1, 2, 3]"
      },
      {
        name: "[:]",
        signature: "[key: value, key2: value2, ...]",
        description: "Map literal for key/value collections.",
        example: '[name: "Alice", age: 30]'
      },
      {
        name: "->",
        signature: "collection->index_or_key",
        description: "Access list indexes or map keys.",
        example: "[1, 2, 3]->1"
      },
      {
        name: "+",
        signature: "list1 + list2",
        description: "Concatenate lists or merge maps.",
        example: "[1, 2] + [3, 4]"
      },
      {
        name: "#",
        signature: "#collection",
        description: "Get the length of collections or strings.",
        example: '#"hello"'
      }
    ]
  },
  "Strings": {
    functions: [
      {
        name: "String Literals",
        signature: '"text"',
        description: "Double-quoted strings with interpolation.",
        example: '"x = {x}"'
      },
      {
        name: "+",
        signature: '"a" + "b"',
        description: "Concatenate strings.",
        example: '"hello, " + "world!"'
      }
    ]
  },
  "Variables & Assignment": {
    functions: [
      {
        name: ":=",
        signature: "x := value",
        description: "Declare a variable and bind it to a value.",
        example: "x := 10"
      },
      {
        name: "=",
        signature: "x = value",
        description: "Assign a new value to an existing variable.",
        example: "x = 20"
      }
    ]
  },
  "Lambdas & Functions": {
    functions: [
      {
        name: "=>",
        signature: "[params] => body",
        description: "Define a lambda function.",
        example: "[x] => x * 2"
      }
    ]
  },
  "Metaprogramming": {
    functions: [
      {
        name: "`",
        signature: "`expression",
        description: "Quote a value without evaluating it.",
        example: "`(thisvariabledoesnotexist + 1)"
      }
    ]
  }
};
function renderDocItem(item) {
  return make(
    "div.api-item",
    {},
    make("strong", {}, item.name),
    ...item.signature ? [make("div.api-signature", {}, make("code", {}, item.signature))] : [],
    make("p", {}, item.description),
    ...item.example ? [make("div", {}, make("strong", {}, "Example:"), make("div.api-example", {}, make("code", {}, item.example)))] : []
  );
}
function renderOperatorGroup(title, ops) {
  return make(
    "section.api-section",
    {},
    make("h3", {}, title),
    ...ops.map((op) => make(
      "div.api-item",
      {},
      make("strong.api-param-name", {}, op.op)
    ))
  );
}
document.addEventListener("DOMContentLoaded", () => {
  const container = get("#language-content");
  if (!container) throw "unreachable";
  const content = Object.entries(LANGUAGE_DOCS).map(([category, docs]) => make(
    "section.api-section",
    {},
    make("h2", {}, category),
    ...docs.functions ? docs.functions.map(renderDocItem) : [],
    ...Object.entries(docs).filter(([key]) => key !== "functions").map(([groupTitle, items]) => renderOperatorGroup(groupTitle, items))
  ));
  container.append(...content);
});
//# sourceMappingURL=docs.js.map
