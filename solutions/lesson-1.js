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
    :  variablep(exp, env)?  resolve(exp, env)
    :  applicablep(exp)?     apply_procedure( operator(exp, env)
                                            , operands(exp, env))
    :  error('Unsure how to handle the expression: ' + stringify(exp)) }

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




//// Tests /////////////////////////////////////////////////////////////////////
function test(program, result) {
    var passed = evaluate(program, environment) === result
    console.log(passed?  '[OK]  ' : '[FAIL]', stringify(program)) }

test(['+', '1', '3'], 4)
test(['+', ['+', '1', '4'], ['-', '7', '2']], 10)
test(['*', '2', '2'], 4)
test(['/', '4', '2'], 2)