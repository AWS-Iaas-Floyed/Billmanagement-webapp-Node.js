cd /etc/profile.d

env

FILE=userdata.sh
while ! test -f "$FILE"; do
    sleep 30s
    echo "$FILE not exist"
done

cd /home/ubuntu
runuser -l ubuntu -c 'npm install'
runuser -l ubuntu -c 'node index.js'