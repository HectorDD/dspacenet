from flask import Flask, jsonify, request
from parse import * 
from maude import *

##Structure of messages: "<clock,id_user>message"
##System files are located inside the following directory
systemfiles="~systemfiles/"

#This function get the ntcc time counter, it's stored in a txt file
def getNtccTime():
    cl=open(systemfiles+"ntcctime.txt","r")
    time=cl.readline()
    cl.close()
    return int(time)
    
maude=MaudeProcess()
    
##Definition of some global variables
nameinput=systemfiles+"run.txt"
nameoutput=systemfiles+"output.txt"
namememory=systemfiles+"memory.txt"
nameprocess=systemfiles+"process.txt"
memory=""
processes=""
ntcctime=getNtccTime()

##Function that errase spaces from a program, that are after every ocurrency of the searchingString
def erraseSpacePostAndSay(program,searchingString):
    index=program.find(searchingString)
    oldindex=0
    while index != -1 :
        index=index+oldindex+4
        while program[index] == " ":
            program=program[:index] + program[index+1:]
        oldindex=index
        index=program[index:].find(searchingString)
    return program

##Function for translating the input process to machine language
def translateProcess(process):
    file = open(systemfiles+"runtranslate.txt","w")
    strtowrite="red in SCCP-RUN : "+process+" . \n"
    file.write(strtowrite)
    file.close()
    os.system('./Maude/maude.linux64 < '+systemfiles+'runtranslate.txt > '+systemfiles+'outputtranslate.txt 2>&1')
    archi = open(systemfiles+"outputtranslate.txt","r")
    notfound=True
    r1=""
    while(notfound and not("Bye." in r1) ):
        r1=archi.readline()
        if "result" in r1:
            notfound=False
        elif "Warning:" in r1:
            notfound=True
            break
    if(notfound):
        stat=open(systemfiles+"status.txt","w")
        stat.write("Error")
        return "Error"
    else:
        resultvar=r1
        notend=True
        while(notend):
            r1=archi.readline()
            if "Bye." in r1:
                notend=False
            else:
                resultvar= resultvar + r1[3:]
        resultvar=erraseLineJump(resultvar)
    parsingResult=parse("result SpaInstruc: {}", resultvar )
    resultvar=parsingResult[0]
    return resultvar

##Function for adding the program id to new process
def addPid(program):
  global ntcctime
  pidstr='{k:pid}'
  index=program.find(pidstr)
  oldindex=0
  while index!=-1:
      index=oldindex+index+3
      pid=str(ntcctime)
      program=program[:index]+pid+program[index+3:]
      oldindex=index+len(pid)
      index=program[oldindex:].find(pidstr)
  return program

##Function for replacing {pid} with the current ntcc clock
def addPidPosted(program):
  global ntcctime
  pidstr='{pid}'
  index=program.find(pidstr)
  oldindex=0
  while index!=-1:
      index=oldindex+index
      pid=str(ntcctime)
      program=program[:index]+pid+program[index+5:]
      oldindex=index+len(pid)
      index=program[oldindex:].find(pidstr)
  return program

##Function that increase the ntcc time counter
def ntccTictac(c):
    cl=open(systemfiles+"ntcctime.txt","w")
    stwrite=str(c+1)
    cl.write(stwrite)
    cl.close()
    
##Function for adding clock and order to post programs
def addIdandOrder(program,id_user):
  global ntcctime
  tellstr='post("'
  index=program.find(tellstr)
  oldindex=0
  ntcctime=getNtccTime()
  while index!=-1:
      index=oldindex+index+6
      userstr="<"+str(ntcctime)+"|" +str(id_user)+">"
      program=program[:index]+userstr+program[index:]
      oldindex=index+len(userstr)
      index=program[oldindex:].find(tellstr)
  program=addIdandOrderSay(program,id_user)
  return program
  
##Function for adding clock and order to say programs
def addIdandOrderSay(program,id_user):
  global ntcctime
  tellstr='say("'
  index=program.find(tellstr)
  oldindex=0
  ntcctime=getNtccTime()
  while index!=-1:
      index=oldindex+index+5
      userstr="<"+str(ntcctime)+"|" +str(id_user)+">"
      program=program[:index]+userstr+program[index:]
      oldindex=index+len(userstr)
      index=program[oldindex:].find(tellstr)
  return program
  
##Function that extract the information of a string that contains a message
def extractInfo(msg):
    global ntcctime
    clock=ntcctime
    parseResult=parse('<{}>{}',msg)
    if parseResult is None :
        if msg.find("{pid") == -1:
            r={'clock' : clock , 'user_msg' : "private" , 'msg' : msg , 'class' : "system" }
        else:
            msg=msg.replace("{","[")
            msg=msg.replace("}","]")
            r={'clock' : clock , 'user_msg' : "private" , 'msg' : msg , 'class' : "process" }
    else :
        info=parseResult[0]
        message=parseResult[1]
        info=info.split("|")
        r={'clock' : info[0] , 'user_msg' : info[1] , 'msg' : message , 'class' : "none" }
    return r

##Function that extract the information of a string that contains the information of a process
def extractInfoProcesses(msg):
    parseResult=parse('<{}>{}',msg)
    if parseResult is None :
	if msg.find("{pid") == -1:
	    r=False
	else:
            r={ 'msg' : msg }
    else :
        r=False
    return r

##Function that load the current state inside the txt files
def refreshState():
    global namememory
    global nameprocess
    mem = open(namememory,"r")
    proc = open(nameprocess,"r")
    global processes
    global memory
    processes = proc.readline()
    memory = mem.readline()
    mem.close()
    proc.close()

refreshState()

##Function that eliminate the first agent of the agents string
def elimOther(agents):
    stack=[]
    index=0
    for i in agents:        
        if i!='[' :
            index+=1
        else:
            index+=1
            stack.append("[")
            break
    while index < len(agents):
        i=agents[index]
        if i=='[':
            stack.append("[")
        elif i==']':
            stack.pop(0)
        index+=1
        if len(stack)==0:
            break
    index+=3
    return agents[index:]

##Function that choose the first agent of the agents string
def getCurrAgent(agents):
    stack=[]
    index=0
    for i in agents:        
        if i!='[' :
            index+=1
        else:
            index+=1
            stack.append("[")
            break
    while index < len(agents):
        i=agents[index]
        if i=='[':
            stack.append("[")
        elif i==']':
            stack.pop(0)
        index+=1
        if len(stack)==0:
            break
    return agents[:index]

##Function that obtains every message inside a string of messages from the memory of an agent
##stringMessages: '"message 1", "message 2", "message 3" ... '
##return: ['message 1', 'message 2', 'message 3' ...]
def splitMessages(stringMessages): 
    messages=[]
    message=""
    quotecounter=0
    for c in stringMessages:
        if c=='"':
            quotecounter+=1
        elif c=="," and quotecounter%2 == 0:
            messages.append(message)
            message=""
        elif quotecounter%2 != 0:
            message=message+c
    messages.append(message)
    return messages

##Function that convert the agent memory in a json list with every message with their information
def convertMemInJson(mem):
    index=1
    dendex=1
    messages="error"
    memParse=parse("({})",mem)
    if memParse != None:
        messages=splitMessages(memParse[0])
    else:

        messages=[mem[1:len(mem)-1]]
    jMessages=[]
    for i in messages:
        jMessages.append(extractInfo(i))

    return jMessages
    
##Function that convert the agent memory in a json list with every information of processes stored on the memory
def convertProcessesInJson(mem):
    index=1
    dendex=1
    messages="error"
    memParse=parse("({})",mem)
    if memParse != None:
        messages=splitMessages(memParse[0])
    else:
        messages=[mem]
    jMessages=[]
    for i in messages:
        element=extractInfoProcesses(i)
        if element != False:
            jMessages.append(i)
    return jMessages

##Function that iterate on the memory, searching the space of an agent
def calculateAgentMemory(agentId):
    refreshState()
    parsingResult=parse("{}[{}]", memory )
    agents=parsingResult[1]

    while agentId>0:
        agents=elimOther(agents)
        agentId=agentId-1
    agents=getCurrAgent(agents)
    
    return agents

##Function that calculate messages on the private mailbox
def calculateMessages(user_from,user_to):
    global memory
    refreshState()
    parsingResult=parse("{}[{}]", memory )
    if parsingResult is None :
        return False
    agents=parsingResult[1]
    while user_to>0:
        agents=elimOther(agents)
        user_to=user_to-1
    agents=getCurrAgent(agents)
    parsingResult=parse("{}[{}]", agents )
    if parsingResult is None :
        return False
    agents=parsingResult[1]
    agents=agents+"]"
    agents=getCurrAgent(agents)
    parsingResult=parse("{}[{}]", agents )
    if parsingResult is None :
        return False
    agents=parsingResult[1]
    agents=agents+"]"
    while user_from>0:
        agents=elimOther(agents)
        user_from=user_from-1
    agents=getCurrAgent(agents)
    parsingResult=parse("{}[{}]", agents )
    if parsingResult is None :
        return False
    agents=parsingResult[0]
    return agents

##Function that store a successful execution on the memory and processes txt files
def saveState(result):
    global processes
    global memory
    parsingResult=parse("result Conf: < {} ; {} >", result )
    processes=parsingResult[0]
    memory=parsingResult[1]
    mem=open(namememory,"w")
    mem.write(memory)
    mem.close()
    proc=open(nameprocess,"w")
    proc.write(processes)
    proc.close()

##Function that errase a line jump
def errorToJson(errors):
    jErrors=[]
    for i in errors:
        element={ 'error' : i }
        jErrors.append(element)
    return jErrors

##Routes of the rest server
import os
app = Flask(__name__)

##This route is for looking if the rest server is on
@app.route('/', methods=['GET'])
def index():
    return jsonify({'message' : 'SCCP'})

##This route is for running a program
##It comunicate the program to the sccp 
##VM and store the result
@app.route('/runsccp', methods=['POST'])
def runsccp():
    global ntcctime
    ntcctime=getNtccTime()
    global processes
    global memory
    global maude
    refreshState()
    received = request.json['config']
    userp = request.json['user']
    received = erraseSpacePostAndSay(received,"post")
    received = erraseSpacePostAndSay(received,"say")
    received = addIdandOrder(received,userp)
    receivedstr=str(received)    
    maude.run("red in SCCP-RUN : "+received+" . \n")
    answer=maude.getOutput()
    if answer[0]=="error":
        errors=errorToJson(answer[1])
        return jsonify({'result' : 'error', 'errors' : errors })
    else:
        parsingResult=parse("result SpaInstruc: {}", answer[1] )
        received=parsingResult[0]
    received = addPid(received)
    received = addPidPosted(received)
    processes = received +" || " + processes
    maude.run("red in NTCC-RUN : IO(< "+processes+" ; empty[empty-forest] >) . \n")
    answer=maude.getOutput()
    if answer[0]=="error":
        errors=errorToJson(answer[1])
        return jsonify({'result' : 'error', 'errors' : errors})
    else:
        saveState(answer[1])
        ntccTictac(ntcctime)
        return jsonify({'result' : 'ok'})
    
##This function returns the global memory
@app.route('/getGlobal', methods=['GET'])
def getGlobal():
    global memory
    
    #answer=getCurrAgent(memory)
    parsingResult=parse("{}[{}]", memory )
    
    if parsingResult[0] is None:
        
        return jsonify({'result' : 'Empty'})
    else:
        
        answer=convertMemInJson(parsingResult[0])
        return jsonify({'result' : answer})

##This function returns the wall of an agent
@app.route('/getWall', methods=['POST'])
def getWall():
    agent=int(request.json['id'])
    answer=calculateAgentMemory(agent)
    paranswer=parse("{}[{}]", answer )
    ranswer=paranswer[0]
    rranswer=convertMemInJson(ranswer)
    rranswer.sort(key=lambda clock: int(clock['clock']),reverse=True)
    return jsonify({'result' : rranswer})

##This function returns the posted processes on a space
@app.route('/getPostedProcesses', methods=['POST'])
def getPostedProcesses():
    agent=int(request.json['id'])
    answer=calculateAgentMemory(agent)
    paranswer=parse("{}[{}]", answer )
    ranswer=paranswer[0]
    rranswer=convertProcessesInJson(ranswer)
    ##rranswer.sort(key=lambda clock: int(clock['clock']),reverse=True)
    return jsonify({'result' : rranswer})

##This route returns a private conversation with a friend
@app.route('/getMsg', methods=['POST'])
def getMsg():
    user_from=int(request.json['user_from'])
    user_to=int(request.json['user_to'])
    sender=calculateMessages(user_from,user_to)
    if not sender :
        sender=[]
    else : 
        sender=convertMemInJson(sender)

    receiver=calculateMessages(user_to,user_from)
    if not receiver :
        receiver=[]
    else : 
        receiver=convertMemInJson(receiver)

    result=sender+receiver
    result.sort(key=lambda clock: int(clock['clock']),reverse=False)
    return jsonify({'messages_to' : result , 'messages_from' : receiver})


if __name__ == '__main__':
    app.run(host= '0.0.0.0',port=8082)
    
