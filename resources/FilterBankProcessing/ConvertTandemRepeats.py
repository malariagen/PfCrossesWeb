import sys

if len(sys.argv)<3:
    print('Usage: COMMAND inputfile outputfile')
    sys.exit()

ifilename=sys.argv[1]
ofilename=sys.argv[2]

#ifilename='C:/Data/Genomes/PfCrosses/InputData/Tandem/TandemRepeats.dat'
#ofilename='C:/Data/Genomes/PfCrosses/InputData/Tandem/tandemOut.txt'

ifile=open(ifilename,'r')
ofile=open(ofilename,'w')

chromoname=''
while True:
    line=ifile.readline()
    if not(line):
        break
    line=line.rstrip('\n')
    if line.startswith('Sequence:'):
        chromoname=line.split(' ')[1]
        print('Reading chromosome {0}'.format(chromoname))
        for i in range(6):
            line=ifile.readline()
        pass
    else:
        if (len(line)>0) and chromoname:
            id=chromoname+'_'+line.split(' ')[0]
            ofile.write('{0} {1}'.format(chromoname,id))
            comps=line.split(' ')
            for i in range(14):
                ofile.write(' {0}'.format(comps[i]))
            ofile.write('\n')

ifile.close()
ofile.close()
