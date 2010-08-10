#ifndef NODE_NTPL_MODULE
#define NODE_NTPL_MODULE

#include <v8.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

struct Replacements_;
struct Position_;

static inline Replacements* new_replacements();
static inline Position* new_position();

static inline Local<String> getInputPart( Position* pos );
static inline Local<String> getInputSymbolPart( Position* pos );

static Local<String> callModificator( Position* pos, Local<Object> modificators );
static void pushVariable( Position* pos, Replacements* replace);

bool parseValidateArgs(const Arguments& args);
Handle<Value> parse(const Arguments& args);

#endif //NODE_NTPL_MODULE