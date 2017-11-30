
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

##Function that errase spaces from a program,
##that are after every ocurrency of the searchingString
##input:
##program -> is the input program,
##searchingString -> the string that the function will search
##for erasing the spaces after it
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

##Function for adding the program id to a new process
##input: program -> process without tags
##output: program -> process tagged, changging
##<pid| with the pid of this time unit
def addPid(program):
  global ntcctime
  pidstr='<pid|'
  index=program.find(pidstr)
  oldindex=0
  while index!=-1:
      index=oldindex+index+1
      pid=str(ntcctime)
      program=program[:index]+pid+program[index+3:]
      oldindex=index+len(pid)
      index=program[oldindex:].find(pidstr)
  return program

##Function for adding the user to a new process
##input:
##program -> process without tags
##user -> the user that will be added to the process
##output: program -> process tagged, changging
##<usn| with the username in the input
def addUser(program,user):
  userstr='|usn>'
  index=program.find(userstr)
  oldindex=0
  while index!=-1:
      index=oldindex+index+1
      program=program[:index]+user+program[index+3:]
      oldindex=index+len(user)
      index=program[oldindex:].find(userstr)
  return program


##Function for adding the program id to a new process
##input: program -> process without tags
##output: program -> process tagged, changing
##{pid} with the pid of this time unit
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

##Function for adding the program id and user to every post in a process
##input: program -> process without tags
##input: id_user -> username of the user who post the process
##output: program -> process tagged, adding clock and username
##to the messages
def addIdandOrder(program,id_user):
  tellstr='post("'
  index=program.find(tellstr)
  oldindex=0
  while index!=-1:
      index=oldindex+index+6
      userstr="<pide|" +str(id_user)+">"
      program=program[:index]+userstr+program[index:]
      oldindex=index+len(userstr)
      index=program[oldindex:].find(tellstr)
  program=addIdandOrderSay(program,id_user)
  return program

##Function for adding the program id and user to every say in a process
##input: program -> process without tags
##input: id_user -> username of the user who post the process
##output: program -> process tagged, adding clock and username
##to the messages
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

##Procediment that load the current state from the txt files
##to the global variables that represent the current memory and processes
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

def calculateAgentMemoryAlpha(store,agentId):
    parsingResult=parse("{}[{}]", store)
    agents=parsingResult[1]
    while agentId>0:
        agents=elimOther(agents)
        agentId=agentId-1
    agents=getCurrAgent(agents)
    return agents

def replacePidAfter(process,timeunit):
    timeunit=str(timeunit)
    pidstr='<pide|'
    index=process.find(pidstr)
    oldindex=0
    while index!=-1:
        index=oldindex+index+1
        process=process[:index]+timeunit+process[index+4:]
        oldindex=index+len(timeunit)
        index=process[oldindex:].find(pidstr)
    return process

##Procediment that store a successful execution on the memory and processes txt files
def saveState(result):
    global ntcctime
    ntcctime=getNtccTime()
    global processes
    global memory
    parsingResult=parse("result Conf: < {} ; {} >", result )
    processes=parsingResult[0]
    memory=parsingResult[1]
    memory=replacePidAfter(memory,ntcctime)
    mem=open(namememory,"w")
    mem.write(memory)
    mem.close()
    proc=open(nameprocess,"w")
    proc.write(processes)
    proc.close()

##Function that get a list of errors and convert it
##into a list of errors in json.
##input: [error1,error2,...,errorn]
##output: [{'error': error1, 'error': error2...,'errorn': errorn}]
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
##For using it.
##input[json]:
##{
## "config" : "here will be an input process"
## "user" : "the user who posts the process"
## "timeu" : "if the timeunit will advance, don't send anything, else, send False"
##}
##output[json]:
##{
## "result" : "it could be ok or error",
## "errors" : "if the result is error,
## here will be the maude errors"
##}
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
    try:
        timeunit = request.json['timeu']
    except:
        timeunit = True
    if received=="":
        return jsonify({'result' : 'error', 'errors' : [{'error' : 'empty input'}]})
    received = erraseSpacePostAndSay(received,"post")
    received = erraseSpacePostAndSay(received,"say")
    received = addIdandOrder(received,userp)
    print received
    try:
        receivedstr=str(received)
    except:
        errors=errorToJson(["characters not allowed"])
        return jsonify({'result' : 'error', 'errors' : errors })
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
    received = addUser(received,userp)
    processes = received +" || " + processes
    maude.run("red in NTCC-RUN : IO(< "+processes+" ; "+memory+" >) . \n")
    answer=maude.getOutput()
    if answer[0]=="error":
        errors=errorToJson(answer[1])
        return jsonify({'result' : 'error', 'errors' : errors})
    else:
        saveState(answer[1])
        if timeunit:
            ntccTictac(ntcctime)
        return jsonify({'result' : 'ok'})

##This route is for get the information of a space
##It obtain the information of the space from
##the SCCP memory.
##For using it.
##input[json]:
##{
## "id" : "a list of integers with the path of the space"
##}
##output[json]:
##{
## "result" : "it could have the list of constraints or an error",
##}
@app.route('/getSpace', methods=['POST'])
def getSpace():
    agent=request.json['id']
    try:
        answer=calculateAgentMemory(int(agent[0]))
        agent.pop(0)
        for i in agent:
            answer=calculateAgentMemoryAlpha(answer,int(i))
        paranswer=parse("{}[{}]", answer )
        try:
            ranswer=paranswer[0]
            rranswer=convertMemInJson(ranswer)
            rranswer.sort(key=lambda clock: int(clock['clock']),reverse=True)
            return jsonify({'result' : rranswer})
        except:
            return jsonify({'result' : 'error1'})
    except:
        return jsonify({'result' : 'error2'})

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
        answer.sort(key=lambda clock: int(clock['clock']),reverse=True)
        return jsonify({'result' : answer})


if __name__ == '__main__':
    app.run(host= '0.0.0.0',port=8082)

