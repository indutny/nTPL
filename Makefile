LIB_PREFIX = $(HOME)/.node_libraries
NODE = node

build:
	@echo "Building..."
	@rm -rf build/ && node-waf configure && node-waf clean && node-waf build
	@rm .lock-wscript

install:
	@echo "Installing..."
	@mkdir -p $(LIB_PREFIX)
	@cp -fr lib/* $(LIB_PREFIX)/
	
uninstall:
	@echo "Uninstalling ..."
	@rm -f $(LIB_PREFIX)/nTPL.js
	@rm -f $(LIB_PREFIX)/nTPL.native.node
	@rm -f $(LIB_PREFIX)/nTPL.block.js
	@rm -f $(LIB_PREFIX)/nTPL.filter.js
	
test:
	@echo "Testing..."
	@cd ./tests && $(NODE) run.js && cd ..

clean:
	@echo "Cleaning directory"
	@rm -rf build/
	
all : uninstall clean build install test
	
.PHONY : build install uninstall test