import os
from os.path import exists, abspath
from os import unlink
from shutil import copy

srcdir = "./nTPL.native"
blddir = "build"

def set_options(opt):
	opt.tool_options('compiler_cxx')
	
def configure(conf):
	conf.check_tool('compiler_cxx')
	conf.check_tool('node_addon')

def build(bld):	
	main = bld.new_task_gen('cxx', 'shlib', 'node_addon')
	main.cxxflags = ["-g"]
	main.target = 'nTPL.native'
	main.source = './nTPL.native/nTPL.native.cc';
	main.includes = "./nTPL.native/"
	
def shutdown():  
    if exists('./lib/nTPL.native.node'):
      unlink('./lib/nTPL.native.node');
    if exists('./build/default/nTPL.native.node'):
      copy('./build/default/nTPL.native.node', './lib/nTPL.native.node')