//// Utilities /////////////////////////////////////////////////////////////////
function car(exp) {
    return exp[0] }


function cdr(exp) {
    return exp.slice(1) }


function operator(exp, env) {
    return evaluate(car(exp), env) }


function operands(exp, env) {
    return cdr(exp).map(function(operand){
        return evaluate(operand, env)})}


function stringify(exp) {
    return JSON.stringify(exp) }


function error(msg) {
    throw new Error(msg) }


var __slice = [].slice
function to_list(exp) {
    return __slice.call(exp) }


function fold(seq, fn, start) {
    seq   = to_list(seq)
    start = seq.length == 1?  start
          :                   seq.shift()

    return seq.reduce(fn, start) }


//// Evaluation ////////////////////////////////////////////////////////////////
function evaluate(exp, env) {
    return numberp(exp)?         eval_number(exp)
    :  variablep(exp, env)?  resolve(exp, env)
    :  applicablep(exp)?     apply_procedure( operator(exp, env)
                                            , operands(exp, env))
    :  error('Unsure how to handle the expression: ' + stringify(exp)) }

function numberp(exp) {
    return !isNaN(exp) }


function applicablep(exp) {
    return Array.isArray(exp) }


function variablep(exp, env) {
    return exp in env }


function eval_number(exp) {
    return +exp }


function apply_procedure(operator, operands) {
    return operator.apply(this, operands) }


function resolve(exp, env) {
    return env[exp] }


//// Environment handling //////////////////////////////////////////////////////
var environment = { }

function define(name, procedure) {
    environment[name] = procedure }


//// Arithmetic procedures /////////////////////////////////////////////////////

define('+', function() {
    return fold(arguments, function(l, r) {
        return l + r }, 0)})


define('-', function() {
    return fold(arguments, function(l, r) {
        return l - r }, 0)})


// Exercise 1.
//
// 1. Implement multiplication and division

define('*', function() {
    return fold(arguments, function(l, r) {
        return l * r }, 1)})


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



//// Tests /////////////////////////////////////////////////////////////////////
function test(program, result) {
    var passed = evaluate(program, environment) === result
    console.log(passed?  '[OK]  ' : '[FAIL]', stringify(program)) }

test(['+', '1', '3'], 4)
test(['+', ['+', '1', '4'], ['-', '7', '2']], 10)
test(['*', '2', '2'], 4)
test(['/', '4', '2'], 2)