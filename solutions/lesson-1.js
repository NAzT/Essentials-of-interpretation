//// Utilities /////////////////////////////////////////////////////////////////
// Returns the first element of a cons-cell
function car(exp) {
    return exp[0] }

// Returns the last element of a cons-cell
function cdr(exp) {
    return exp.slice(1) }

// Evaluates the operator of the expresion in the given environment
function operator(exp, env) {
    return evaluate(car(exp), env) }

// Evaluates the operands (in order) of the expression in the given environment
function operands(exp, env) {
    return cdr(exp).map(function(operand){
        return evaluate(operand, env)})}

// Returns a JSON representation of the expression
function stringify(exp) {
    return JSON.stringify(exp) }

// Throws an error message
function error(msg) {
    throw new Error(msg) }

// Converts an arbitrary object to a List
var __slice = [].slice
function to_list(exp) {
    return __slice.call(exp) }

// Folds the sequence from left->right
function fold(seq, fn, start) {
    seq   = to_list(seq)
    start = seq.length == 1?  start
          :                   seq.shift()

    return seq.reduce(fn, start) }


//// Evaluation ////////////////////////////////////////////////////////////////
// Evaluates the expression in the given environment
function evaluate(exp, env) {
    return numberp(exp)?         eval_number(exp)
    : variablep(exp, env)?  resolve(exp, env)
    : applicablep(exp)?     apply_procedure( operator(exp, env)
                                            , operands(exp, env))
    : error('Unsure how to handle the expression: ' + stringify(exp)) }

// Checks if the expression is a number
function numberp(exp) {
    return !isNaN(exp) }

// Checks if the expression is a function application
function applicablep(exp) {
    return Array.isArray(exp) }

// Checks if the expression is a known variable
function variablep(exp, env) {
    return exp in env }

// Evals a numeric expression
function eval_number(exp) {
    return +exp }

// Applies the procedure defined by `operator` to `operands`
function apply_procedure(operator, operands) {
    return operator.apply(this, operands) }

// Resolves the symbol given by the expression in the given environment
function resolve(exp, env) {
    return env[exp] }


//// Environment handling //////////////////////////////////////////////////////
var environment = { }

// Defines a new symbol in the environment
function define(name, procedure) {
    environment[name] = procedure }


//// Arithmetic procedures /////////////////////////////////////////////////////
// Addition
define('+', function() {
    return fold(arguments, function(l, r) {
        return l + r }, 0)})

// Subtraction
define('-', function() {
    return fold(arguments, function(l, r) {
        return l - r }, 0)})


// Exercise 1.
//
// 1. Implement multiplication and division

// Multiplication
define('*', function() {
    return fold(arguments, function(l, r) {
        return l * r }, 1)})

// Division
define('/', function() {
    return fold(arguments, function(l, r) {
        return l / r }, 1)})


// Exercise 2.
//
// Encapsulate and improve handling of similar expression types in
// `eval' reusing the code by getting the type and running needed
// evaluator by dynamic name:
//
// E.g.:
//
//   var expressionType = getType(exp)
//   return this['evaluate' + expressionType](exp)
//
// - Done with testing for function application capability (see
//   `applicablep') on the evaluator, then evaluating the operator and
//   operands (see `operator' and `operands'), and applying the first to
//   the latter (see `apply_procedure').


// Exercise 3.
//
// Write a parser which translates concrete syntax to AST. Chose any
// concrete syntax, e.g. infix math notation:
//
//   1 + 3 -> ["+", "1", "3"]
//
//
// I actually choose S-exps <3 The BNF is as follows:
//
// program ::= <expression>*
//
// expression ::= <application>
//              | <number>
//              | <operator>
//
// application ::= "(" <expression> [WHITESPACE <expression>] ")"
//
// number ::= [<sign>] <digit>+ ["." <digit>+]
//
// sign ::= "-" | "+"
//
// digit ::= "0" .. "9"
//
// operator ::= "+"
//            | "-"
//            | "/"
//            | "*"
//
function Parser() { }
Parser.prototype = function() {
    return { constructor: Parser
      , parse: parse
      , parse_program: parse_program
      , parse_expression: parse_expression
      , parse_application: parse_application
      , parse_number: parse_number
      , parse_operator: parse_operator
      , parse_parameters: parse_parameters
      , build: build
      , save: save
      , restore: restore
      , match: match
      , current: current }

    function parse(code) {
        this.input = code.trim()
        this.index = 0
        this.state = []

        return this.parse_program() }


    function value(ast) {
        return ast && ast.length?  ast
        :                    null }


    function parse_program() { var thing, ast
        ast = []
        while (thing = this.parse_expression())
            ast = ast.concat(thing)

        return value(ast) }


    function parse_expression() {
        return this.parse_application()
        || this.parse_number()
        || this.parse_operator() }


    function parse_application() {
        return nest(this.build( this.match(/^\s*\(/)
                     , ignore(/^\s*\(/)
                     , this.parse_operator.bind(this)
                     , this.parse_parameters.bind(this)
                     , ignore(/^\s*\)/))) }


    function parse_number() {
        return this.build( this.match(/^\s*[-+]?\d/)
                , ignore(/^\s*/)
                , require(/^[-+]?\d+(?:\.\d+)?/, 'Number')) }


    function parse_operator() {
        return this.build( this.match(/^\s*[-+\/*]/)
                , ignore(/^\s*/)
                , require(/^[-+\/*]/, 'Operator')) }


    function parse_parameters() {
        return this.build( this.match(/^\s*[^\)]/)
                , ignore(/^\s+/)
                , nest(this.parse_expression.bind(this))
                , this.parse_parameters.bind(this)) }


    function build(test) { var rules
        rules = __slice.call(arguments, 1)
        this.save()
        if (test)
            return rules.map(function(rule){
                       return rule(this) }, this)
                   .reduce(function(acc, ast){
                       if (ast && ast.nest)  acc.push(ast)
                       else if (ast)        acc = acc.concat(ast)
                       return acc }, [])
        this.restore() }


    function save() {
        this.state.push(this.index) }


    function restore() {
        this.index = this.state.pop() || 0 }


    function match(re) {
        return this.current().match(re) }


    function current() {
        return this.input.slice(this.index) }


    function consume(re){ return function(ps) { var result
        result = ps.match(re)
        if (result) {
            result    = result[0]
            ps.index += result.length
            return result }}}


    function require(re, thing){ return function(ps){ var result
        result = consume(re)(ps)
        if (!result)  throw new Error("Expected " + thing || re)
        return result }}


    function ignore(re){ return function(ps) {
        consume(re)(ps) }}


    function nest(ast) {
        if (ast)  ast.nest = true
        return ast }
}()



//// Tests /////////////////////////////////////////////////////////////////////
// Tests a program evaluation against an expected result
function test(program, expected) { var actual, passed
    actual = evaluate(program, environment)
    passed = actual === expected
    console.log(passed?  '[OK]  ' : '[FAIL]', stringify(program)
              + ' === ' + stringify(expected))
    if (!passed)
        console.log('\tExpected: ' + stringify(expected)
                  + ', got: ' + stringify(actual)) }

// Tests the program parser
function testp(program) {
    console.log('AST for ' + program + ': ', (new Parser).parse(program)) }


// Testes the program parser and evaluation against an expected result
function teste(program, expected) {
    return test((new Parser).parse(program), expected) }


test(['+', '1', '3'], 4)
test(['+', ['+', '1', '4'], ['-', '7', '2']], 10)
test(['*', '2', '2'], 4)
test(['/', '4', '2'], 2)

testp('1')
testp('+34')
testp('-345.23')
testp('   -34.4')
testp('+')
testp('   /')
testp('()')
testp('(3 4 5)')
testp('(+ 3 4 +34.34)')
testp('(+ 3 (* 2 2) 4)')

teste('(+ 1 3)', 4)
teste('(+ (+ 1 4) (- 7 2))', 10)
teste('(* 2 2)', 4)
teste('(/ 4 2)', 2)
teste('-34.4', -34.4)
teste('(+3 (*2 2) 4)', 11)