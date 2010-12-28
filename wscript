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
	ntpl = bld.new_task_gen('cxx', 'shlib', 'node_addon')
	ntpl.cxxflags = ["-g",]
	ntpl.target = 'ntpl.native'
	ntpl.source = bld.path.ant_glob('ntpl.native/*.cc')
	ntpl.includes = 'ntpl.native/'
	
def shutdown():  
    if exists('./lib/ntpl/ntpl.native.node'):
      unlink('./lib/ntpl/ntpl.native.node');
    if exists('./build/default/ntpl.native.node'):
      copy('./build/default/ntpl.native.node', './lib/ntpl/ntpl.native.node')    