# coding=utf-8
from parse import * 
clock=2
def erraseSpacePostAndSay(program,searchingString):
    index=program.find(searchingString)
    oldindex=0
    while index != -1 :
        index=index+oldindex+4
        print index
        while program[index] == " ":
            program=program[:index] + program[index+1:]
        oldindex=index
        print("old",oldindex)
        index=program[index:].find(searchingString)
        print("index",index)
    return program

print erraseSpacePostAndSay("post       (alasjas)    post   (aslknaskjds)    post(asdsgf) post () ","post")
        