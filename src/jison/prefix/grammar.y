%start Program

%%

Program
    : Expression
        { console.log($1, '=', eval($1)); }
    ;

Expression
    : LSB OPERATOR COMMA Arguments RSB
        { $$ = $Arguments.join($OPERATOR); }
    ;

Arguments
    : Arguments COMMA Argument
        { $Arguments.push($Argument); $$ = $Arguments; }
    | Argument
        { $$ = [$Argument] }
    ;

Argument
    : Literal
    | Expression
    ;

Literal
    : Number
    ;

Number
    : INT
        { $$ = Number($1) }
    ;