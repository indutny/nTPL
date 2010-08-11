LIB_PREFIX = $(HOME)/.node_libraries
NODE = node

build:
	@echo "Building nTPL ..."
	@rm -rf build/ && node-waf configure && node-waf build
	@rm .lock-wscript
	@rm -rf build/

install:
	@echo "Installing nTPL ..."
	@mkdir $(LIB_PREFIX)
	@cp -fr lib/* $(LIB_PREFIX)/
	
uninstall:
	@echo "Uninstalling nTPL ..."
	@rm -f $(LIB_PREFIX)/nTPL.js
	@rm -f $(LIB_PREFIX)/nTPL.native.node
	@rm -f $(LIB_PREFIX)/nTPL.block.js
	@rm -f $(LIB_PREFIX)/nTPL.filter.js
	
test:
	@cd ./tests && $(NODE) run.js && cd ..

.PHONY : build install uninstall test