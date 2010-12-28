LIB_PREFIX = $(HOME)/.node_libraries
NODE = node

build:
	@echo "Building..."
	@rm -rf build/ && node-waf configure && node-waf clean && node-waf build
	@rm .lock-wscript

install:
	@echo "Installing..."
	@mkdir -p $(LIB_PREFIX)
	@cp -fr lib/ntpl/* $(LIB_PREFIX)/
	
uninstall:
	@echo "Uninstalling ..."
	@rm -f $(LIB_PREFIX)/ntpl.js
	@rm -f $(LIB_PREFIX)/ntpl.native.node
	@rm -f $(LIB_PREFIX)/ntpl.block.js
	@rm -f $(LIB_PREFIX)/ntpl.filter.js
	
test:
	@echo "Testing..."
	@cd ./tests && $(NODE) run.js && cd ..

clean:
	@echo "Cleaning directory"
	@rm -rf build/
	
all : uninstall clean build install

dev : uninstall clean build install test
	
.PHONY : build install uninstall test