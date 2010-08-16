/*
* Part of nTPL
* nTPL.native v.0.2.1
* Copyright 2010, Fedor Indutny
* Released under MIT license
*/
#include <v8.h>
#include <stdio.h>  // sprintf
#include <string.h> // strlen

#include "nTPL.mod.h"

using namespace v8;
#ifdef NODE_NTPL_MODIFICATORS_MODULE
using namespace nTPL;
#endif //NODE_NTPL_MODIFICATORS_MODULE

namespace nTPL {

	static Persistent<String> REPLACEMENTS_SYMBOL;
	static Persistent<String> REPLVARS_SYMBOL;
	static Persistent<String> CODE_SYMBOL;
	static Persistent<String> ARGS_SYMBOL;
	static Persistent<String> OPTIONS_SYMBOL;

	// Parser states
	enum PARSER_STATE {
	  STAND_BY  =  0,
	  BRACES_MODIFICATOR = 1,
	  BRACES    =  2,
	  COMMENT_BRACES = 3,
	  OPTIONS_BRACES = 4
	};

	// Here will be replacements
	struct Replacements_ {
		Local<Array> replacements;
		Local<Array> replVars;
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
		Local<Object> options;
		
		unsigned char* input;
		
	};
	typedef struct Position_ Position;

	static inline Replacements* new_replacements()
	{
		Replacements* result = new Replacements;
		
		result->replacements_count = 0;
		
		return result;
	}

	static inline Position* new_position(unsigned char* input)
	{
		Position* result = new Position;
		
		result->current = 0;
		result->last = 0;
		result->codePosition = 0;
		result->input = input;		
		
		return result;
	}

	static inline Local<String> getInputPart( Position* pos)
	{
		HandleScope scope;
		
		// Get part of input using parser's last pos and current pos
		Local<String> result =  String::New( (char*) pos->input + pos->last, pos->current - pos->last );
		
		return scope.Close(result);
	}

	static inline Local<String> getInputSymbolPart( Position* pos)
	{
		HandleScope scope;
		
		// Get part of input using parser's last pos and current pos
		Local<String> result =  String::NewSymbol( (char*) pos->input + pos->last, pos->current - pos->last );
		
		return scope.Close(result);
	}

	static Local<String> callModificator( Position* pos, Local<Object> modificators )
	{
		HandleScope scope;
		
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
					return scope.Close(tmp->ToString());
				}
				else 
				{
					return scope.Close(String::Concat(pos->modificator, code));
				}
			}
			
			// Get function
			Local<Function> x = Local<Function>::Cast(tmp);
			
			// Create arguments:
			//  * code
			//  * namespace
			Local<Value> argv[3] = { code , pos->namespace_ , pos->options};
			
			// Call it & return String value
			return scope.Close(x->Call(modificators, 3, argv)->ToString());
			
		} else
		{
			return scope.Close(String::Concat(pos->modificator, code));
		}
	}

	static void pushVariable( Position* pos, Replacements* replace)
	{
		HandleScope scope;
		
		Local<String> var_value = getInputPart(pos);
		
		// If not empty
		if (!var_value->Length())
			return;
		
		// Add replacement var
		replace->replacements->Set(
			replace->replacements_count,
			var_value
		);
		
		// Add r to replVars
		// Will be joined in javascript
		replace->replVars->Set(
			replace->replacements_count,
			Integer::New(replace->replacements_count)
		);	
		
		// Create buffer for output
		char* var_num = new char[28];
		
		// Templating
		sprintf(var_num, "$p($%d,$_);", replace->replacements_count);
		
		// Increment count
		replace->replacements_count++;
		
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

	#define PARSER_OP(offset, char) (pos->input[pos->current+offset] == char)
	#define PARSER_OP2(tok) (pos->input[pos->current] == tok[0] && pos->input[pos->current+1] == tok[1])
	#define PARSER_MOVE(offset) pos->last=(pos->current+=offset)
	#define PARSER_OP_SPACES(offset) (PARSER_OP(0,' ') || PARSER_OP(0,'\t'))
	Handle<Value> parse(const Arguments& args)
	{
		HandleScope scope;
		Local<Object> result = Object::New();
		
		// Validate arguments
		if (!parseValidateArgs(args))
			return scope.Close(result);
		
		// Parse arguments
		String::Utf8Value inputData(args[0]->ToString());
		Local<Object> modificators = Local<Object>::Cast(args[1]);
		
		// Prepare parser vars
		Replacements* replace = new_replacements();
		replace->replacements = Array::New();
		replace->replVars = Array::New();
		
		// Set parser pos
		Position* pos = new_position((unsigned char*) *inputData);
		pos->modificator = String::NewSymbol("");
		pos->code = Array::New();
		
		// Include namespace into position
		pos->namespace_ = Local<Object>::Cast(args[2]);
		
		// Create options object
		pos->options = Object::New();
		pos->options->Set(ARGS_SYMBOL, Array::New());
		
		PARSER_STATE state = STAND_BY;		
		
		while( pos->input[pos->current] )
		{	

			// Open code-braces {% ... %}
			if (state == STAND_BY && PARSER_OP2("{%"))
			{	
				
				// Push all that was before
				pushVariable(pos, replace);
				
				// Change state & pos
				state = BRACES_MODIFICATOR;
				PARSER_MOVE(2);
				
			}
			// Catch modificator {%modificator ... %}
			else if (state == BRACES_MODIFICATOR && PARSER_OP_SPACES(0))
			{
				// Get modificator
				pos->modificator = getInputSymbolPart(pos);
		
				// Change state & pos
				state = BRACES;
				PARSER_MOVE(0);
			}
			// Close code-braces 
			else if ((state == BRACES || state == BRACES_MODIFICATOR)
					 && PARSER_OP2("%}"))
			{
				// Case: {%modificator_name%}
				// State will be BRACES_MODIFICATOR
				// But %} will be found
				if (state == BRACES_MODIFICATOR) {
				
					// Get modificator && changes pos
					pos->modificator = getInputSymbolPart(pos);
					PARSER_MOVE(0);
				}			
				Local<String> code_piece = callModificator(pos, modificators);
				
				// If not empty
				if (code_piece->Length())
					pos->code->Set(pos->codePosition++, code_piece);
				
				// Change state & pos
				state = STAND_BY;
				PARSER_MOVE(2);
				
			}		
			// Open comment braces {* ... *}
			else if (state == STAND_BY && PARSER_OP2("{*"))
			{
				// Push all that was before
				pushVariable(pos, replace);
				
				// Change state & pos
				state = COMMENT_BRACES;
				PARSER_MOVE(2);
			}
			// Close comment braces
			else if (state == COMMENT_BRACES && PARSER_OP2("*}"))
			{
				// Change state & pos
				state = STAND_BY;
				PARSER_MOVE(2);
			}
			// Skip symbols
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
		result->Set( REPLACEMENTS_SYMBOL, replace->replacements );
		result->Set( REPLVARS_SYMBOL, replace->replVars );
		result->Set( CODE_SYMBOL, pos->code );
		result->Set( OPTIONS_SYMBOL, pos->options );
		
		// Avoid memory leaks
		delete replace;
		delete pos;
		
		return scope.Close(result);	
	}
	#undef PARSER_OP
	#undef PARSER_OP2
	#undef PARSER_MOVE
	#undef PARSER_OP_SPACES
	
	#define EXPOSE_FUNC(label, func) target->Set(String::NewSymbol(label), func)
	#define PERS_LABEL(label) Persistent<String>::New(String::NewSymbol(label))

	extern "C" void init (Handle<Object> target)
	{
		HandleScope scope;
		
		REPLACEMENTS_SYMBOL = PERS_LABEL("replacements");
		CODE_SYMBOL = PERS_LABEL("code");
		REPLVARS_SYMBOL = PERS_LABEL("replVars");
		ARGS_SYMBOL = PERS_LABEL("args");
		OPTIONS_SYMBOL = PERS_LABEL("options");
		
		#ifdef NODE_NTPL_MODIFICATORS_MODULE
		mod::init(target);
		#endif //NODE_NTPL_MODIFICATORS_MODULE
		
		EXPOSE_FUNC("parse",FunctionTemplate::New(parse)->GetFunction());
	}
	#undef EXPOSE_FUNC
	#undef PERS_LABEL

}