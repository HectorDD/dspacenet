# coding=utf-8
from parse import * 
clock=2
def extractInfo(msg):
    global clock
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

l=['<365|hectordavid1228>helloworld', '<366|hectordavid1228>blablabla', '<366|hectordavid1228>hello,thisismywall', "{pid:365|hectordavid1228}post('helloworld')", "{pid:366|hectordavid1228}post('blablabla')", "{pid:366|hectordavid1228}post('hello,thisismywall')"]

for i in l:
    print extractInfo(i)
