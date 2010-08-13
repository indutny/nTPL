import os
from os.path import exists, abspath
from os import unlink
from shutil import copy

srcdir = "."
blddir = "build"

def set_options(opt):
	opt.tool_options('compiler_cxx')
	
def configure(conf):
	conf.check_tool('compiler_cxx')
	conf.check_tool('node_addon')

def build(bld):
	cargo = bld.new_task_gen('cxx', 'shlib', 'node_addon')
	cargo.cxxflags = ["-g",]
	cargo.target = 'nTPL.native'
	cargo.source = 'nTPL.native/nTPL.native.cc,nTPL.native/nTPL.mod.cc'
	cargo.includes = 'nTPL.native/'
	
def shutdown():  
    if exists('./lib/nTPL.native.node'):
      unlink('./lib/nTPL.native.node');
    if exists('./build/default/nTPL.native.node'):
      copy('./build/default/nTPL.native.node', './lib/nTPL.native.node')    