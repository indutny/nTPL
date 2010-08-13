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
	nTPL = bld.new_task_gen('cxx', 'shlib', 'node_addon')
	nTPL.cxxflags = ["-g",]
	nTPL.target = 'nTPL.native'
	nTPL.source = bld.path.ant_glob('nTPL.native/*.cc')
	nTPL.includes = 'nTPL.native/'
	
def shutdown():  
    if exists('./lib/nTPL.native.node'):
      unlink('./lib/nTPL.native.node');
    if exists('./build/default/nTPL.native.node'):
      copy('./build/default/nTPL.native.node', './lib/nTPL.native.node')    