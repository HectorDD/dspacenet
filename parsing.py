# coding=utf-8

global procesos

procesos = 'repeat tell("hola")'

from parse import *

def quitarSaltoLinea(resultado):
    nuevo=""
    for i in resultado:
        if i != '\n':
            nuevo+=i
    return nuevo

import os


def translateProcess():
    global procesos
    file = open("runtranslate.txt","w")
    file.write("red in SCCP-RUN : "+procesos+" . \n")
    file.close()
    os.system('./Maude/maude.linux64 < runtranslate.txt > outputtranslate.txt')
    archi = open("outputtranslate.txt","r")
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

translateProcess()
print(procesos)
