#ifndef NODE_NTPL_MODIFICATORS_MODULE
#define NODE_NTPL_MODIFICATORS_MODULE

#include <v8.h>
#include <stdio.h>

using namespace v8;

namespace nTPL {

	Handle<Value> equal(const Arguments& args);
	
	Handle<Value> addNativeModificators(const Arguments& args);

}

#endif // NODE_NTPL_MODIFICATORS_MODULE