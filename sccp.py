from flask import Flask, jsonify, request
from parse import * 

##Structure of messages: "(clock,id_user)message"

nameinput="run.txt"
nameoutput="output.txt"
namememory="memory.txt"
nameprocess="process.txt"
memoria=""
procesos=""
clock=0

def functionf():
    global procesos
    global memoria
    global semaforo
    archi = open("runf.txt","w")
    archi.write("red in NTCC-RUN : f("+procesos+ ") . \n")
    archi.close()
    os.system('./Maude/maude.linux64 < runf.txt > outputf.txt')
    archi = open("outputf.txt","r")
    notfound=True
    r1=""
    while(notfound and not("Bye." in r1) ):
        r1=archi.readline()
        if "result" in r1:
            notfound=False
    if(notfound):
        stat=open("status.txt","w")
        stat.write("Error")
        semaforo=True
        return jsonify({'result' : 'Error'})
        
    else:
        resultado=r1
        notend=True
        while(notend):
            r1=archi.readline()
            if "Bye." in r1:
                notend=False
            else:
                resultado= resultado + r1[3:]
        resultado=quitarSaltoLinea(resultado)
    parsingResult=parse("result SpaInstruc: {}", resultado )
    resultado=parsingResult[0]
    procesos = resultado


def tictac(c):
    cl=open("clock.txt","w")
    stwrite=str(c+1)
    cl.write(stwrite)
    cl.close()
def getClock():
    cl=open("clock.txt","r")
    clock=cl.readline()
    cl.close()
    return int(clock)

def addIdandOrder(program,id_user):
  global clock
  tellstr='post('
  index=program.find(tellstr)
  oldindex=0
  while index!=-1:
      clock=getClock()
      index=oldindex+index+6
      userstr="<"+str(clock)+"|" +str(id_user)+">"
      program=program[:index]+userstr+program[index:]
      oldindex=index+len(userstr)
      index=program[oldindex:].find(tellstr)
      tictac(clock)
  program=addIdandOrderSay(program,id_user)
  return program

def addIdandOrderSay(program,id_user):
  global clock
  tellstr='say('
  index=program.find(tellstr)
  oldindex=0
  while index!=-1:
      clock=getClock()
      index=oldindex+index+5
      userstr="<"+str(clock)+"|" +str(id_user)+">"
      program=program[:index]+userstr+program[index:]
      oldindex=index+len(userstr)
      index=program[oldindex:].find(tellstr)
      tictac(clock)
  return program

def extractInfo(msg):
    global clock
    parseResult=parse('{}<{}>{}"',msg)
    if parseResult is None :
        r={'clock' : clock , 'user_msg' : "private" , 'msg' : msg }
    else :
        info=parseResult[1]
        message=parseResult[2]
        info=info.split("|")
        r={'clock' : info[0] , 'user_msg' : info[1] , 'msg' : message }
    return r

def refreshState():
    global namememory
    global nameprocess
    mem = open(namememory,"r")
    proc = open(nameprocess,"r")
    global procesos
    global memoria
    procesos = proc.readline()
    memoria = mem.readline()
    mem.close()
    proc.close()

refreshState()

semaforo=True

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
        
def convertMemInJson(mem):
    index=1
    dendex=1
    messages="error"
    memParse=parse("({})",mem)
    if memParse != None:
        messages=memParse[0].split(",")
    else:
        messages=[mem]
    jMessages=[]
    for i in messages:
        jMessages.append(extractInfo(i))
    
    return jMessages
    

def calculateAgentMemory(agentId):
    refreshState()
    parsingResult=parse("{}[{}]", memoria )
    agents=parsingResult[1]

    while agentId>0:
        agents=elimOther(agents)
        agentId=agentId-1
    agents=getCurrAgent(agents)
    
    return agents

def calculateMessages(user_from,user_to):
    global memoria
    refreshState()
    parsingResult=parse("{}[{}]", memoria )
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

def saveState(result):
    global procesos
    global memoria
    global semaforo
    parsingResult=parse("result Conf: < {} ; {} >", result )
    procesos=parsingResult[0]
    functionf()
    memoria=parsingResult[1]
    mem=open(namememory,"w")
    mem.write(memoria)
    mem.close()
    proc=open(nameprocess,"w")
    proc.write(procesos)
    proc.close()
    semaforo=True
    
def quitarSaltoLinea(resultado):
    nuevo=""
    for i in resultado:
        if i != '\n':
            nuevo+=i
            
    return nuevo

import os
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message' : 'SCCP'})

##Only SCCP (Rest for the old version)

@app.route('/runsccp', methods=['POST'])
def runsccp():
    global semaforo
    if semaforo:   
        semaforo=False
        global procesos
        global memoria
        refreshState()
        recibido = request.json['config']
        userp = request.json['user']
        recibido = addIdandOrder(recibido,userp)
        procesos = recibido +" || " + procesos
        archi = open(nameinput,"w")
        archi.write("rew in SCCP-RUN : < "+procesos+" ; empty[empty-forest] > . \n")
        archi.close()
        os.system('./Maude/maude.linux64 < run.txt > output.txt')
        archi = open(nameoutput,"r")
        notfound=True
        r1=""
        while(notfound and not("Bye." in r1) ):
            r1=archi.readline()
            if "result" in r1:
                notfound=False
        if(notfound):
            stat=open("status.txt","w")
            stat.write("Error")
            semaforo=True
            return jsonify({'result' : 'Error'})
            
        else:
            resultado=r1
            notend=True
            while(notend):
                r1=archi.readline()
                if "Bye." in r1:
                    notend=False
                else:
                    resultado= resultado + r1[3:]

            
            resultado=quitarSaltoLinea(resultado)

            if(resultado[0]=="r"):
                saveState(resultado)
                functionf()
            return jsonify({'result' : 'ok'})
    else:
        return jsonify({'result' : 'bussy'})

    
@app.route('/getFriendMem', methods=['POST'])
def getFriendMem():
    agent=int(request.json['id'])
    answer=calculateAgentMemory(agent)
    paranswer=parse("{}[{}]{}", answer )
    ranswer=paranswer[0]

    return jsonify({'result' : ranswer})

@app.route('/getMyMem', methods=['POST'])
def getMyMem():
    agent=int(request.json['id'])
    answer=calculateAgentMemory(agent)
    return jsonify({'result' : answer})
    
@app.route('/getGlobal', methods=['GET'])
def getGlobal():
    global memoria
    answer=getCurrAgent(memoria)
    parsingResult=parse("{}[{}]", answer )
    if parsingResult[0] is None:
        return jsonify({'result' : 'lala'})
    else:
        answer=convertMemInJson(parsingResult[0])
        return jsonify({'result' : answer})
    
@app.route('/getWall', methods=['POST'])
def getWall():
    agent=int(request.json['id'])
    answer=calculateAgentMemory(agent)
    paranswer=parse("{}[{}]", answer )
    ranswer=paranswer[0]
    rranswer=convertMemInJson(ranswer)
    rranswer.sort(key=lambda clock: int(clock['clock']),reverse=True)
    return jsonify({'result' : rranswer})

@app.route('/getMsg', methods=['POST'])
def getMsg():
    user_from=int(request.json['user_from'])
    user_to=int(request.json['user_to'])
    sender=calculateMessages(user_from,user_to)
    if not sender :
        sender=[]
    else : 
        sender=convertMemInJson(sender)
        print sender
    receiver=calculateMessages(user_to,user_from)
    if not receiver :
        receiver=[]
    else : 
        receiver=convertMemInJson(receiver)
        print receiver
    result=sender+receiver
    result.sort(key=lambda clock: int(clock['clock']),reverse=False)
    return jsonify({'messages_to' : result , 'messages_from' : receiver})


if __name__ == '__main__':
    app.run(host= '0.0.0.0',port=8082)
    
