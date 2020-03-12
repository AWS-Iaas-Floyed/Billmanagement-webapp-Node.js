cd /etc/profile.d

FILE=userdata.sh
while ! test -f "$FILE"; do
    sleep 30s
    echo "$FILE not exist"
done

cd /home/ubuntu
npm install
node index.js