# coding=utf-8

from parse import * 


clock=0
def addIdandOrder(program,id_user):
  global clock
  tellstr='post('
  index=program.find(tellstr)
  oldindex=0
  while index!=-1:
      index=oldindex+index+6
      userstr="<"+str(clock)+"," +str(id_user)+">"
      program=program[:index]+userstr+program[index:]
      oldindex=index+len(userstr)
      index=program[oldindex:].find(tellstr)
      clock+=1
  return program
  
def extractInfo(msg):
    parseResult=parse("<{}>{}",msg)
    info=parseResult[0]
    message=parseResult[1]
    info=info.split(",")
    r={'clock' : info[0] , 'user_msg' : info[1] , 'msg' : message }
    return r
    
    

##cadena='tell("olakase señor") || tell("jesus T_T") || tell("test") || when lala do tell("eh que vaina")'
##print(addIdandOrder(cadena,1))

mensajes=[]
cadena2="<3,1>eh que vaina"
result=extractInfo(cadena2)
mensajes.append(result)
cadena2="<1,1>jesus T_T"
result=extractInfo(cadena2)
mensajes.append(result)
cadena2="<0,1>olakase senor"
result=extractInfo(cadena2)
mensajes.append(result)
cadena2="<2,1>test"
result=extractInfo(cadena2)
mensajes.append(result)

mensajes.sort(key=lambda clock: clock['clock'])
print mensajes

s="<0.1>primera prueba"
parseResult=parse("<{}>{}",s)
print parseResult[0]

procesoproblema='exit 2 do enter 3 do when * . "hec" . * . "frank" . * do exit 3 do enter 2 do tell ("careful they are talking about you") '
