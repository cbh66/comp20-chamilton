yes X | awk '{printf("%s", $0)}' | dd of=big-string.txt bs=100 count=1000
for (( ; ; )) do
    curl --data "login=$(cat big-string.txt)&lat=0&lng=0" http://arcane-ridge-5647.herokuapp.com/sendLocation
done