# coding=utf-8
from parse import * 
dictionary = {}
    
def StoreRoot(mem):
    global dictionary
    parsingResult=parse("{}[{}]", mem )
    parsingResult[1]
    return 0


function StoreMemory(mem):
    stack=[0]
    mem=StoreRoot(mem)
    i=0
    while i < len(mem):
        if mem[i] == "[":
            stack.append(0)
            i+=1
        elif mem[i] == "]":
            stack.pop()
            i+=1
        elif mem[i] == ":" :
            stack.append(stack.pop()+1)
            i+=1
        elif mem[i:i+12] == "empty-forest":
            i+=12
        else:
            i+=StoreChildren(mem,stack)
        
        
