// 数学命令定义 - 类似 Corca 的建议系统
export interface MathCommand {
  name: string;
  latex: string;
  category: string;
  keywords: string[];
  description?: string;
  icon?: string;
}

export const MATH_COMMANDS: MathCommand[] = [
  // Calculus - 微积分
  {
    name: 'Summation',
    latex: '\\sum_{i=1}^{n}',
    category: 'Calculus',
    keywords: ['sum', 'summation', '求和', '总和'],
    icon: '∑',
  },
  {
    name: 'Integral',
    latex: '\\int_{a}^{b}',
    category: 'Calculus',
    keywords: ['int', 'integral', '积分'],
    icon: '∫',
  },
  {
    name: 'Limit',
    latex: '\\lim_{x \\to \\infty}',
    category: 'Calculus',
    keywords: ['lim', 'limit', '极限'],
    icon: 'lim',
  },
  {
    name: 'Partial Derivative',
    latex: '\\frac{\\partial}{\\partial x}',
    category: 'Calculus',
    keywords: ['partial', 'derivative', '偏导'],
    icon: '∂',
  },

  // Algebra - 代数
  {
    name: 'Fraction',
    latex: '\\frac{a}{b}',
    category: 'Algebra',
    keywords: ['frac', 'fraction', 'divide', '分数', '除'],
    icon: 'a/b',
  },
  {
    name: 'Square Root',
    latex: '\\sqrt{x}',
    category: 'Algebra',
    keywords: ['sqrt', 'root', '根号', '平方根'],
    icon: '√',
  },
  {
    name: 'N-th Root',
    latex: '\\sqrt[n]{x}',
    category: 'Algebra',
    keywords: ['root', 'nroot', 'nth', 'n次根'],
    icon: 'ⁿ√',
  },
  {
    name: 'Power',
    latex: 'x^{n}',
    category: 'Algebra',
    keywords: ['power', 'exponent', 'sup', 'superscript', '幂', '上标'],
    icon: 'xⁿ',
  },
  {
    name: 'Subscript',
    latex: 'x_{n}',
    category: 'Algebra',
    keywords: ['sub', 'subscript', '下标'],
    icon: 'xₙ',
  },

  // Operators - 运算符
  {
    name: 'Plus',
    latex: '+',
    category: 'Operator',
    keywords: ['plus', 'add', '加'],
    icon: '+',
  },
  {
    name: 'Minus',
    latex: '-',
    category: 'Operator',
    keywords: ['minus', 'subtract', '减'],
    icon: '−',
  },
  {
    name: 'Plus-Minus',
    latex: '\\pm',
    category: 'Operator',
    keywords: ['pm', 'plusminus', '正负'],
    icon: '±',
  },
  {
    name: 'Times',
    latex: '\\times',
    category: 'Operator',
    keywords: ['times', 'multiply', '乘'],
    icon: '×',
  },
  {
    name: 'Divide',
    latex: '\\div',
    category: 'Operator',
    keywords: ['div', 'divide', '除'],
    icon: '÷',
  },

  // Greek Letters - 希腊字母
  {
    name: 'Alpha',
    latex: '\\alpha',
    category: 'Greek',
    keywords: ['alpha', 'α'],
    icon: 'α',
  },
  {
    name: 'Beta',
    latex: '\\beta',
    category: 'Greek',
    keywords: ['beta', 'β'],
    icon: 'β',
  },
  {
    name: 'Gamma',
    latex: '\\gamma',
    category: 'Greek',
    keywords: ['gamma', 'γ'],
    icon: 'γ',
  },
  {
    name: 'Delta',
    latex: '\\delta',
    category: 'Greek',
    keywords: ['delta', 'δ'],
    icon: 'δ',
  },
  {
    name: 'Pi',
    latex: '\\pi',
    category: 'Greek',
    keywords: ['pi', 'π'],
    icon: 'π',
  },
  {
    name: 'Theta',
    latex: '\\theta',
    category: 'Greek',
    keywords: ['theta', 'θ'],
    icon: 'θ',
  },
  {
    name: 'Lambda',
    latex: '\\lambda',
    category: 'Greek',
    keywords: ['lambda', 'λ'],
    icon: 'λ',
  },
  {
    name: 'Sigma',
    latex: '\\sigma',
    category: 'Greek',
    keywords: ['sigma', 'σ'],
    icon: 'σ',
  },

  // Matrices & Brackets
  {
    name: 'Matrix',
    latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
    category: 'Matrix',
    keywords: ['matrix', 'bmatrix', '矩阵'],
    icon: '[ ]',
  },
  {
    name: 'Parentheses',
    latex: '\\left( x \\right)',
    category: 'Bracket',
    keywords: ['paren', 'parentheses', '括号'],
    icon: '( )',
  },
  {
    name: 'Brackets',
    latex: '\\left[ x \\right]',
    category: 'Bracket',
    keywords: ['bracket', 'square', '方括号'],
    icon: '[ ]',
  },
  {
    name: 'Braces',
    latex: '\\left\\{ x \\right\\}',
    category: 'Bracket',
    keywords: ['brace', 'curly', '花括号'],
    icon: '{ }',
  },

  // Relations - 关系符号
  {
    name: 'Equals',
    latex: '=',
    category: 'Relation',
    keywords: ['equal', 'equals', '等于'],
    icon: '=',
  },
  {
    name: 'Not Equal',
    latex: '\\neq',
    category: 'Relation',
    keywords: ['neq', 'notequal', '不等于'],
    icon: '≠',
  },
  {
    name: 'Less Than',
    latex: '<',
    category: 'Relation',
    keywords: ['less', 'lt', '小于'],
    icon: '<',
  },
  {
    name: 'Greater Than',
    latex: '>',
    category: 'Relation',
    keywords: ['greater', 'gt', '大于'],
    icon: '>',
  },
  {
    name: 'Less or Equal',
    latex: '\\leq',
    category: 'Relation',
    keywords: ['leq', 'le', '小于等于'],
    icon: '≤',
  },
  {
    name: 'Greater or Equal',
    latex: '\\geq',
    category: 'Relation',
    keywords: ['geq', 'ge', '大于等于'],
    icon: '≥',
  },

  // Product & Coproduct
  {
    name: 'Product',
    latex: '\\prod_{i=1}^{n}',
    category: 'Calculus',
    keywords: ['prod', 'product', '连乘'],
    icon: '∏',
  },
  {
    name: 'Infinity',
    latex: '\\infty',
    category: 'Symbol',
    keywords: ['inf', 'infinity', '无穷'],
    icon: '∞',
  },
];

// 搜索数学命令
export function searchMathCommands(query: string): MathCommand[] {
  if (!query || query.trim() === '') {
    return MATH_COMMANDS.slice(0, 8); // 返回前8个常用命令
  }

  const lowerQuery = query.toLowerCase().trim();

  return MATH_COMMANDS.filter((cmd) => {
    // 搜索名称、类别和关键词
    return (
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      cmd.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
    );
  }).slice(0, 10); // 最多返回10个结果
}
