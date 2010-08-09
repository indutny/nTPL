/*
* Part of nTPL
* nTPL.native v.0.0.1
* Copyright 2010, Fedor Indutny
* Released under MIT license
*/
#include <v8.h>
#include <stdio.h>  // sprintf
#include <stdlib.h> // malloc
#include <string.h> // strlen

using namespace v8;

// Parser states
enum PARSER_STATE {
  STAND_BY  =  0,
  BRACES_MODIFICATOR = 1,
  BRACES    =  2
};

// Here will be replacements
struct Replacements_ {
	Local<Array> replacements;
	int replacements_count;
};
typedef struct Replacements_ Replacements;

// Will hold parser position
struct Position_ {
	int last;
	int current;
	
	Local<String> modificator;
	
	Local<Array> code;
	int codePosition;
	
	Local<Object> namespace_;
	
	unsigned char* input;
	
};
typedef struct Position_ Position;

static inline Replacements* new_replacements()
{
	Replacements* result = (Replacements*) malloc(sizeof(Replacements));
	
	result->replacements = Array::New();
	result->replacements_count = 0;
	
	return result;
}

static inline Position* new_position(unsigned char* input, Local<Object> namespace_)
{
	Position* result = (Position*) malloc(sizeof(Position));
	
	result->current = 0;
	result->last = 0;
	result->modificator = String::New("");
	result->code = Array::New();
	result->codePosition = 0;
	result->input = input;
	// Include namespace into position
	result->namespace_ = namespace_;
	
	return result;
}

static inline Local<String> getInputPart( Position* pos)
{
	// Get part of input using parser's last pos and current pos
	Local<String> result =  String::New( (char*) pos->input + pos->last, pos->current - pos->last );
	return result;
}

static Local<String> callModificator( Position* pos, Local<Object> modificators )
{
	// Get code from input
	Local<String> code = getInputPart( pos );
	
	// If modificator is not empty && "modificators" has this property
	if (pos->modificator->Length() && modificators->Has(pos->modificator))
	{
		// Get properties' value
		Local<Value> tmp = modificators->Get(pos->modificator);	
	
		// If not function - return unprocessed code or modificator's value
		// (note, that modificator in this case is part of code too!)
		if (!tmp->IsFunction())
		{
			// If not undefined - return modificator's value
			if (!tmp->IsUndefined())
			{
				return tmp->ToString();
			}
			else 
			{
				return String::Concat(pos->modificator, code);
			}
		}
		
		// Get function
		Local<Function> x = Local<Function>::Cast(tmp);
		
		// Create arguments:
		//  * code
		//  * namespace
		Local<Value> argv[2] = { code , pos->namespace_ };
		
		// Call it & return String value
		return x->Call(modificators, 2, argv)->ToString();
		
	} else
	{
		return String::Concat(pos->modificator, code);
	}
}

static void pushVariable( Position* pos, Replacements* replace)
{
	Local<String> var_value = getInputPart(pos);
	
	// If not empty
	if (!var_value->Length())
		return;
	
	// Create buffer for output
	char* var_num = new char[28];
	
	// Templating
	sprintf(var_num, "$p($r[%d],$_);", replace->replacements_count);
	
	// Add replacement var
	replace->replacements->Set(
		replace->replacements_count++,
		var_value
	);
	
	// Push template into code
	pos->code->Set(pos->codePosition++, String::New( var_num )); 
}

bool parseValidateArgs(const Arguments& args)
{	
	// Three arguments must be passed:
	// * Input string
	// * Modificators object
	// * Namespace object
	if ((args.Length() < 3) ||
		(!args[0]->IsString()) ||
		(!args[1]->IsObject()) ||
		(!args[2]->IsObject()) )
	{
		return false;
	}
	
	return true;
}

Handle<Value> parse(const Arguments& args)
{
	HandleScope scope;
	Local<Object> result = Object::New();
	
	// Validate arguments
	if (!parseValidateArgs(args))
		return scope.Close(result);
	
	// Parse arguments
	String::Utf8Value inputData(args[0]->ToString());
	Local<Object> modificators = args[1]->ToObject();
		
	// Prepare parser vars
	Replacements* replace = new_replacements();
	
	// Set parser pos
	Position* pos = new_position((unsigned char*) *inputData, args[2]->ToObject());
		
	PARSER_STATE state = STAND_BY;
	
	while( pos->input[pos->current] )
	{
		if (pos->input[pos->current] == '{' && pos->input[pos->current+1] == '%')
		{	
			
			// Push all that was before
			pushVariable( pos, replace);
			
			// Change state & pos
			state = BRACES_MODIFICATOR;
			pos->last = (pos->current+= 2);
			
		}
		else if ((state == BRACES || state == BRACES_MODIFICATOR)
		 && pos->input[pos->current] == '%' && pos->input[pos->current+1] == '}')
		{
			// Case: {%modificator_name%}
			// State will be BRACES_MODIFICATOR
			// But %} will be found
			if (state == BRACES_MODIFICATOR) {
			
				// Get modificator && changes pos
				pos->modificator = getInputPart(pos);
				pos->last = pos->current;
			}			
			Local<String> code_piece = callModificator(pos, modificators);
			
			// If not empty
			if (code_piece->Length())
				pos->code->Set(pos->codePosition++, code_piece);
			
			// Change state & pos
			state = STAND_BY;
			pos->last = (pos->current+= 2);
			
		}
		else if (state == BRACES_MODIFICATOR && pos->input[pos->current] == ' ')
		{
			// Get modificator
			pos->modificator = getInputPart(pos);
	
			// Change state & pos
			state = BRACES;
			pos->last = pos->current;
		}
		else
		{
			// Change pos
			pos->current++;
		}
		
	}
	
	// Process terminating characters
	if (state == STAND_BY) {
		pushVariable( pos, replace);
	}
	
	// Set output keys
	result->Set( String::New("replacements"), replace->replacements );
	result->Set( String::New("code"), pos->code );
	
	// Avoid memory leaks
	free(replace);
	free(pos);
	
	return scope.Close(result);	
}

extern "C" void init (Handle<Object> target)
{
  HandleScope scope;
  target->Set(String::New("parse"), FunctionTemplate::New(parse)->GetFunction());
}
